Minden Agent (Prototype)
========================

Purpose
- Connects to the Minden platform with an Agent Token (bound to a tenant & machine).
- Sends heartbeats, discovered services, and logs.
- (Planned) Streams metrics, manages decoy services (Docker or native), and establishes an SSH reverse tunnel for remote ops.

Quick Start (Linux)
1) Build
   - Requires Go 1.20+
   - `cd binaire/agent && go build -o minden-agent`
2) Run
   - `SERVER_URL=https://your.minden.app TOKEN=YOUR_AGENT_TOKEN ./minden-agent`
3) Systemd (optional)
   - Copy `minden-agent.service` to `/etc/systemd/system/`
   - `systemctl daemon-reload && systemctl enable --now minden-agent`

Config
- Env vars:
  - `SERVER_URL` (e.g., https://minden.app)
  - `TOKEN` (AgentToken from the machine page)
  - `AGENT_VERSION` (optional, default 0.1.0)
  - `HEARTBEAT_SEC` (default 30), `SERVICES_SEC` (default 60)

What it does now
- Heartbeat: hostname, IP, version
- Services (naive): tries `ss -lntup` to enumerate listening ports (best-effort)
- Logs: send log events (hook points provided)

Roadmap
- Decoy services:
  - Docker: run lightweight images for SSH/HTTP/DB honeypots (label them, restrict access to container network)
  - Native stubs: simple Go servers emulating banners (SSH/FTP/SMTP) with controlled vulnerabilities (no real shell)
- Orchestration:
  - Templates per decoy profile (webapp, db, smtp)
  - Per-tenant policy: which ports to open, rotation, auto-shutdown
- Metrics:
  - CPU/RAM/Net/Disk via /proc and cgroups
  - Docker stats (`docker stats --no-stream`)
- Reverse tunnel:
  - Use `ssh -N -R <remote_port>:localhost:<local_port> bastion@host` (configurable)
  - Or integrate cloudflared as alternate tunnel
- WS control channel:
  - Upgrade to WebSocket for real-time commands (disconnect IP, start/stop decoy, change banners)
  - Signed commands scoped to machine + tenant
- Hardening:
  - Run as non-root where possible; capabilities only when required
  - AppArmor/SELinux profiles for decoys
  - Token rotation and mTLS (long-term)

Security Considerations
- Never run an actual vulnerable real service; use controlled emulation
- Isolate decoys (Docker/VM) from the host and tenant production networks
- Rate-limit and capture payloads; redact secrets on upload

