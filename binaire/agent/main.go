package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type IngestReq struct {
	Token   string      `json:"token"`
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func hostname() string {
	h, _ := os.Hostname()
	return h
}

func primaryIP() string {
	ifaces, _ := net.Interfaces()
	for _, iface := range ifaces {
		if (iface.Flags & net.FlagUp) == 0 {
			continue
		}
		addrs, _ := iface.Addrs()
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue
			}
			return ip.String()
		}
	}
	return ""
}

func postJSON(url string, token string, typ string, payload interface{}) error {
	body := IngestReq{Token: token, Type: typ, Payload: payload}
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", url, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	http.DefaultClient.Timeout = 15 * time.Second
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Failed to send %s: %v", typ, err)
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		log.Printf("Ingest %s failed with status %d", typ, resp.StatusCode)
		return fmt.Errorf("ingest status %d", resp.StatusCode)
	}
	log.Printf("Successfully sent %s to server", typ)
	return nil
}

type Service struct {
	Name     string      `json:"name"`
	Port     *int        `json:"port,omitempty"`
	Protocol string      `json:"protocol,omitempty"`
	Status   string      `json:"status,omitempty"`
	Meta     interface{} `json:"meta,omitempty"`
}

type LogEvent struct {
	Level   string      `json:"level"`
	Source  string      `json:"source"`
	Message string      `json:"message"`
	Payload interface{} `json:"payload,omitempty"`
}

func discoverServices() []Service {
	var svcs []Service

	// Try netstat first (more portable)
	if out, err := exec.Command("netstat", "-tlnp").Output(); err == nil {
		svcs = append(svcs, parseNetstatOutput(string(out))...)
	}

	// Fallback to ss if netstat fails
	if len(svcs) == 0 {
		if out, err := exec.Command("ss", "-tlnp").Output(); err == nil {
			svcs = append(svcs, parseSSOutput(string(out))...)
		}
	}

	// Additional service detection via lsof
	if out, err := exec.Command("lsof", "-i", "-P", "-n").Output(); err == nil {
		additional := parseLsofOutput(string(out))
		svcs = mergeServices(svcs, additional)
	}

	log.Printf("Discovered %d services", len(svcs))
	return svcs
}

func parseNetstatOutput(output string) []Service {
	var svcs []Service
	portRegex := regexp.MustCompile(`tcp\s+\d+\s+\d+\s+[^:]*:(\d+)\s+[^:]*:\*\s+LISTEN\s*(\d+/(\S+))?`)

	for _, line := range strings.Split(output, "\n") {
		if matches := portRegex.FindStringSubmatch(line); len(matches) > 1 {
			port, _ := strconv.Atoi(matches[1])
			name := "unknown"
			var pid *int
			process := ""

			if len(matches) > 3 && matches[2] != "" {
				if p, err := strconv.Atoi(matches[2][:strings.Index(matches[2], "/")]); err == nil {
					pid = &p
				}
				process = matches[3]
				name = identifyService(port, process)
			}

			svcs = append(svcs, Service{
				Name:     name,
				Port:     &port,
				Protocol: "tcp",
				Status:   "LISTEN",
				Meta: map[string]interface{}{
					"process": process,
					"pid":     pid,
				},
			})
		}
	}
	return svcs
}

func parseSSOutput(output string) []Service {
	var svcs []Service
	portRegex := regexp.MustCompile(`tcp\s+LISTEN\s+\d+\s+\d+\s+[^:]*:(\d+)\s+[^:]*:\*\s+users:\(\("([^"]+)",pid=(\d+),`)

	for _, line := range strings.Split(output, "\n") {
		if matches := portRegex.FindStringSubmatch(line); len(matches) > 3 {
			port, _ := strconv.Atoi(matches[1])
			process := matches[2]
			pid, _ := strconv.Atoi(matches[3])
			name := identifyService(port, process)

			svcs = append(svcs, Service{
				Name:     name,
				Port:     &port,
				Protocol: "tcp",
				Status:   "LISTEN",
				Meta: map[string]interface{}{
					"process": process,
					"pid":     pid,
				},
			})
		}
	}
	return svcs
}

func parseLsofOutput(output string) []Service {
	var svcs []Service
	portRegex := regexp.MustCompile(`(\S+)\s+(\d+)\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+[^:]*:(\d+)\s+\(LISTEN\)`)

	for _, line := range strings.Split(output, "\n") {
		if matches := portRegex.FindStringSubmatch(line); len(matches) > 3 {
			process := matches[1]
			pid, _ := strconv.Atoi(matches[2])
			port, _ := strconv.Atoi(matches[3])
			name := identifyService(port, process)

			svcs = append(svcs, Service{
				Name:     name,
				Port:     &port,
				Protocol: "tcp",
				Status:   "LISTEN",
				Meta: map[string]interface{}{
					"process": process,
					"pid":     pid,
				},
			})
		}
	}
	return svcs
}

func identifyService(port int, process string) string {
	// Common port mappings
	commonPorts := map[int]string{
		22:    "ssh",
		23:    "telnet",
		25:    "smtp",
		53:    "dns",
		80:    "http",
		110:   "pop3",
		143:   "imap",
		443:   "https",
		993:   "imaps",
		995:   "pop3s",
		3306:  "mysql",
		5432:  "postgresql",
		6379:  "redis",
		27017: "mongodb",
	}

	if name, exists := commonPorts[port]; exists {
		return name
	}

	// Process name based identification
	processLower := strings.ToLower(process)
	if strings.Contains(processLower, "ssh") {
		return "ssh"
	} else if strings.Contains(processLower, "http") || strings.Contains(processLower, "nginx") || strings.Contains(processLower, "apache") {
		return "http"
	} else if strings.Contains(processLower, "mysql") {
		return "mysql"
	} else if strings.Contains(processLower, "postgres") {
		return "postgresql"
	} else if strings.Contains(processLower, "redis") {
		return "redis"
	} else if strings.Contains(processLower, "mongo") {
		return "mongodb"
	}

	return process
}

func mergeServices(existing, additional []Service) []Service {
	seen := make(map[string]bool)
	var merged []Service

	// Add existing services
	for _, svc := range existing {
		key := fmt.Sprintf("%s:%d", svc.Protocol, *svc.Port)
		if !seen[key] {
			seen[key] = true
			merged = append(merged, svc)
		}
	}

	// Add additional services if not already seen
	for _, svc := range additional {
		key := fmt.Sprintf("%s:%d", svc.Protocol, *svc.Port)
		if !seen[key] {
			seen[key] = true
			merged = append(merged, svc)
		}
	}

	return merged
}

func sendLogEvent(ingestURL, token, level, source, message string, data interface{}) {
	logPayload := map[string]interface{}{
		"level":   level,
		"source":  source,
		"message": message,
		"payload": data,
	}

	go func() {
		if err := postJSON(ingestURL, token, "log", logPayload); err != nil {
			log.Printf("Failed to send log event: %v", err)
		}
	}()
}

func monitorSystemLogs(ingestURL, token string) {
	// Monitor common log files
	logFiles := []string{
		"/var/log/auth.log",
		"/var/log/secure",
		"/var/log/syslog",
		"/var/log/messages",
	}

	for _, logFile := range logFiles {
		go tailLogFile(logFile, ingestURL, token)
	}
}

func tailLogFile(filename, ingestURL, token string) {
	file, err := os.Open(filename)
	if err != nil {
		return // File doesn't exist or no permission
	}
	defer file.Close()

	// Seek to end of file
	file.Seek(0, 2)

	scanner := bufio.NewScanner(file)
	for {
		for scanner.Scan() {
			line := scanner.Text()
			if isInterestingLogLine(line) {
				sendLogEvent(ingestURL, token, "info", filename, line, nil)
			}
		}
		time.Sleep(1 * time.Second)
	}
}

func isInterestingLogLine(line string) bool {
	keywords := []string{
		"authentication failure",
		"failed login",
		"invalid user",
		"connection closed",
		"suspicious",
		"attack",
		"intrusion",
		"unauthorized",
		"denied",
		"blocked",
	}

	lineLower := strings.ToLower(line)
	for _, keyword := range keywords {
		if strings.Contains(lineLower, keyword) {
			return true
		}
	}
	return false
}

func main() {
	server := getenv("SERVER_URL", "http://localhost:3000")
	token := os.Getenv("TOKEN")
	if token == "" {
		log.Fatal("TOKEN is required")
	}
	ingest := strings.TrimRight(server, "/") + "/api/agents/ingest"
	version := getenv("AGENT_VERSION", "0.1.0")
	hbEvery := time.Duration(atoi(getenv("HEARTBEAT_SEC", "30"))) * time.Second
	svEvery := time.Duration(atoi(getenv("SERVICES_SEC", "60"))) * time.Second

	log.Printf("Starting Minden Agent v%s", version)
	log.Printf("Server: %s", server)
	log.Printf("Heartbeat every %v, Services every %v", hbEvery, svEvery)

	// Send startup log
	sendLogEvent(ingest, token, "info", "agent", "Minden Agent started", map[string]interface{}{
		"version":  version,
		"hostname": hostname(),
		"ip":       primaryIP(),
	})

	// Start log monitoring
	go monitorSystemLogs(ingest, token)

	// Initial heartbeat
	if err := postJSON(ingest, token, "heartbeat", map[string]any{
		"hostname": hostname(),
		"ip":       primaryIP(),
		"version":  version,
	}); err != nil {
		log.Printf("Initial heartbeat failed: %v", err)
	}

	// Initial services discovery
	svcs := discoverServices()
	if err := postJSON(ingest, token, "services", svcs); err != nil {
		log.Printf("Initial services discovery failed: %v", err)
	}

	hbTicker := time.NewTicker(hbEvery)
	svTicker := time.NewTicker(svEvery)
	logTicker := time.NewTicker(5 * time.Minute) // Status log every 5 minutes

	for {
		select {
		case <-hbTicker.C:
			if err := postJSON(ingest, token, "heartbeat", map[string]any{
				"hostname": hostname(),
				"ip":       primaryIP(),
				"version":  version,
			}); err != nil {
				log.Printf("Heartbeat failed: %v", err)
			}

		case <-svTicker.C:
			svcs := discoverServices()
			if err := postJSON(ingest, token, "services", svcs); err != nil {
				log.Printf("Services discovery failed: %v", err)
			}

		case <-logTicker.C:
			sendLogEvent(ingest, token, "info", "agent", "Agent status update", map[string]interface{}{
				"uptime":   time.Since(time.Now().Add(-5 * time.Minute)),
				"hostname": hostname(),
				"ip":       primaryIP(),
			})
		}
	}
}

func atoi(s string) int {
	var n int
	fmt.Sscanf(s, "%d", &n)
	if n <= 0 {
		n = 1
	}
	return n
}
