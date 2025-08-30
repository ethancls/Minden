# Repository Guidelines

## Project Structure & Modules
- Next.js App Router: `app/[locale]/...` (pages, API routes), `components/` (UI), `lib/` (utils), `messages/` (i18n), `prisma/` (schema), `public/` (assets), `scripts/` (tooling), `binaire/` (agent docs).
- Internationalization: `messages/en.json`, `messages/fr.json` and `i18n/request.ts` for next-intl.
- Data: Prisma models for Tenants, Members, Machines, Services, LogEvents, Alerts; Postgres via Docker.

## Build, Dev, and Database
- `npm run dev`: start app at `http://localhost:3000`.
- `npm run build` / `npm start`: production build/start.
- `make db-up` / `make db-down` / `make db-logs`: Postgres via Docker.
- `npm run prisma:generate` / `npm run prisma:migrate` / `npm run prisma:studio`: Prisma workflows.
- S3-compatible storage (MinIO): `make s3-up`, `make s3-logs`, `make s3-down`.

## Coding Style & UI
- TypeScript, strict mode; 2-space indentation.
- shadcn/ui + Radix; Tailwind design tokens (blue/orange palette; light/dark), no hard‑coded strings (i18n only).
- Naming: PascalCase (components/types), camelCase (functions/vars), kebab-case (files), `*Tests` (when tests exist).

## Recent Changes
- Pivot to Minden (multi‑tenant honeypot) and removal of “pills” domain.
- Added Tenants/Machines/Services/Logs/Alerts models, agent token ingest, and S3 image proxy.
- Tenant selection page with server actions; access gated to ACTIVE tenants.
- Full i18n (en/fr/ru) for header, landing, auth (verify), settings, machines, tenants, admin, subscriptions.

## Roadmap (Next)
- Agent WS channel (real‑time commands), decoy orchestration (Docker/native stubs), metrics, reverse SSH tunnel.
- Alerts + AI correlation rules; destinations (email/webhook/Slack) and block actions.
- Tenant tools: switcher, member roles, SSO/SAML/OIDC, audit logs, billing (Stripe), domain mapping (subdomains).
- Observability: tracing/logs metrics, dashboards, rate‑limit & abuse controls.

## Next.js Best Practices
- App Router with server components by default; server actions for mutations; zod validation at API edge.
- i18n via next-intl with explicit locale; no hard‑coded UI text.
- Error/NotFound boundaries; streaming where helpful; cache/revalidate intentionally.
- Minimal client components; dynamic import for heavy/optional parts.
- Security headers (CSP, Referrer-Policy, Frame-Options), HTTPS everywhere; sanitize/escape logs.

## Security & ISO 27001 Guidance
- Least privilege: scoped agent tokens, per‑tenant RBAC, short‑lived sessions, secret rotation.
- Data protection: encryption in transit (TLS) and at rest (DB/S3), backups with tested restore (RPO/RTO), retention policies.
- Secure SDLC: dependency scanning, SBOM, code reviews, linting, SAST; patch cadence.
- Access control: MFA for admin, audit trails (user/tenant actions, agent commands), segregation of duties.
- Incident response: alerting playbooks, evidence retention, forensics‑ready logs.
- Hardening: containers non‑root, namespaces/AppArmor; decoys emulate vulnerabilities but cannot escalate; isolate from prod networks.

## Enterprise Ops
- Observability: structured logs (tenant/machine IDs, correlation IDs), metrics (R/L/S), SLOs and error budgets.
- Background work: queues for heavy jobs (stems/metrics/AI); idempotent handlers.
- Releases: zero‑downtime migrations (Prisma), feature flags, staged rollouts.

## Testing
- Add tests under `tests/` mirroring `app/` and `lib/`. Use Playwright and/or Vitest when introduced.
- Keep tests deterministic; mock network/AI/S3.

## Commits & PRs
- Conventional Commits (e.g., `feat: add machine ingest`, `fix(auth): handle unverified email`).
- PRs: clear description, linked issues (`Closes #123`), screenshots for UI changes, and migration notes.

## Security & Configuration
- Never commit secrets. Copy `.env.example` to `.env.local` and fill required keys.
- Auth: NextAuth (Google, GitHub, Apple, Email, Credentials). SMTP is required for magic links.
- Storage: set `S3_*` env to enable S3 uploads; otherwise local `public/uploads` fallback is used.
 - Multi-tenant: only ACTIVE tenants can create machines; new tenants default to PENDING and must be approved by an admin.

## PWA & Mobile
- PWA: add manifest (`/public/manifest.webmanifest`), icons (`/public/icons/*`), and a service worker (e.g., `next-pwa` or custom) to enable installability and offline cache for routes and assets.
- Responsive: all pages/components must be mobile-first with Tailwind responsive classes (`sm:`, `md:`, `lg:`), test on iPhone/Android sizes and ensure interactive elements are accessible (tap targets ≥44px).

What’s next (choose what to tackle first)

Option A — Tenant/admin UX

- Admin tenants (/admin/tenants) to approve PENDING → ACTIVE (with audit).
- Header tenant switcher dropdown (quick change from any page).
- i18n additions for new pages.

Option B — Real-time agent control

- WebSocket channel (/api/agents/ws) for:
    - Real-time logs, heartbeats, metrics streaming.
    - Commands (start/stop decoy, rotate token, set banners).
- Agent WS client (fallback to HTTP ingest).

Option C — Decoy services + metrics

- Decoy (safe) emulation:
    - Native Go stubs (fake SSH/FTP/SMTP banners), easy isolation.
    - Docker runner (isolated network) with lifecycle via WS commands.
- Metrics collector (CPU/RAM/NET/Disk, docker stats) and “metrics” ingest type; charts on machine page.

Option D — Alerts + AI

- Rules engine: trigger alerts on suspicious patterns (failed auths/IP scan rate).
- AI log analysis endpoint, show insights on machine page.
- Notifications: email/webhook; optional auto-block actions.

Security/Segmentation baseline (already considered)

- Tokens hashed, shown once; enforce tenant membership and ACTIVE status.
- Next.js server actions for sensitive mutations; no secrets in logs.
- Add rate-limits to ingest; security headers; consider PCIe/ISO docs next.

je voudrais d'abord que l'authentification soit parfaite, il manque des fonctionnalités importantes pour les entreprises comme l'AD le SAML l'oAUTH le mfa etc, je voudrais implementer ces solutions plus pro pour
▌mon application, je voudrais aussi que l'authentification soit vraiment robuste. Je souhaiterais aussi améliore le design des pages, le bouton pour voir/cacher le mot de passe, pour le sign up, je voudrais un
▌truc qui check le mot de passe pour qu'il soit robuste etc, il faudrait aussi que ces méthodes de connexions soit dynamiques, si une entreprise décide de faire sans le magic