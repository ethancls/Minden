Agent Binary Protocol (MVP)
===========================

This document describes how the honeypot agent binary should connect and report to the web app.

Auth & Identity
- Each machine has an AgentToken (string) created server-side.
- The agent authenticates by including the token in every request.
- Base URL: https://<your-app> (or http://localhost:3000 for dev)

Endpoints (HTTP, JSON)
- POST /api/agents/ingest
  - Body: { token: string, type: 'heartbeat' | 'services' | 'log', payload: any }
  - Heartbeat payload: { hostname?: string, ip?: string, version?: string }
  - Services payload: Array<{ name: string, port?: number, protocol?: string, status?: 'RUNNING'|'STOPPED'|'UNKNOWN', meta?: any }>
  - Log payload: { level?: 'INFO'|'WARN'|'ERROR', source?: string, message: string, payload?: any }

Loop (recommended)
1. On start, send heartbeat (hostname/ip/version) every 30s
2. Enumerate services (ports/process list) and POST type=services periodically (e.g., 60s)
3. Send logs (type=log) for events (auth attempts, inbound connections)

Security
- Keep tokens secret (store in local file with restricted perms)
- Rotate tokens on compromise
- Prefer HTTPS in production

Future (WebSocket)
- A persistent WS channel will replace HTTP polling for real-time commands (disconnect attacker, trigger DDOS tarpits, etc.)

