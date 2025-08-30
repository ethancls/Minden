# Minden — Multi‑tenant Honeypot & Threat Analytics

A multi‑tenant honeypot and monitoring platform. Spin up realistic decoys, stream logs, analyze with AI and trigger alerts/auto‑responses per tenant. Built with Next.js, Prisma, Postgres, and shadcn UI.

## Features
- Landing (marketing) + App per tenant
- Auth: Google, GitHub, Apple, Email Magic Link, Credentials (NextAuth)
- i18n: English/French UI
- App: Tenants, Machines, Services, Logs, Alerts
- Admin: users/tenants/machines/logs metrics + charts
- UI: Tailwind + shadcn/ui (Radix)
- DB: Postgres (Docker), Prisma schema/migrations
- Storage: S3-compatible (MinIO) or local fallback

## Tech Stack
- Next.js 14 (App Router), TypeScript
- next-intl (i18n), next-themes (dark mode)
- NextAuth + Prisma Adapter
- Prisma ORM, PostgreSQL
- Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- OpenAI API (optional for AI suggestions)

## Project Structure
- `app/[locale]/...`: Pages (server/client), API routes
- `components/`: UI components (shadcn/Radix)
- `lib/`: helpers (`prisma`, `auth`, `utils`, `slugify`)
- `messages/`: `en.json`, `fr.json`
- `i18n/request.ts`: next-intl configuration
- `prisma/schema.prisma`: database models
- `public/`: static assets
- `scripts/`: tooling (e.g., `promote-admin.mjs`)
- `binaire/`: agent protocol docs & future binary

## Getting Started
1) Env: copy `.env.example` → `.env.local` and fill values
- Database: `DATABASE_URL`
- NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` (+ auth if needed)
- OAuth: `GOOGLE_*`, `GITHUB_*`, `APPLE_*`
- AI (optional): `OPENAI_API_KEY`
- S3 (optional): `S3_ENDPOINT`, `S3_PUBLIC_URL`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`

2) Start services and app
- DB: `make db-up`
- S3 (MinIO): `make s3-up` (console at http://localhost:9001)
- Install deps: `npm install`
- Prisma: `npm run prisma:generate && npm run prisma:migrate`
- Dev server: `npm run dev` → http://localhost:3000/en

3) Admin access
- Create an account, then promote: `node scripts/promote-admin.mjs your@email`
- Admin dashboard: `/{locale}/admin`

## Upload Flow
- API: `POST /api/upload`
  - If `S3_*` env is configured → uploads to S3 bucket (`uploads/{id}.{ext}`) and returns a public URL using `S3_PUBLIC_URL` (or `S3_ENDPOINT`).
  - Else → saves to `public/uploads` (local dev fallback).
- Composer uses the endpoint for main and additional images.

## Notes
- For shadcn/ui exact examples, run locally:
  - `npx shadcn@latest init -d`
  - `npx shadcn@latest add dialog dropdown-menu avatar navigation-menu tabs tooltip sheet toast -o`
- Replace local uploads with presigned PUTs for production-grade security.
