# syntax=docker/dockerfile:1.7

# Multi-stage Dockerfile for Minden web app (no agent)

FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat

# Install deps with exact lock
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client if script exists (ignore failure in CI without prisma)
RUN npm run prisma:generate || true
RUN npm run build

# Development image (hot reload server)
FROM base AS dev
WORKDIR /app
ENV NODE_ENV=development \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm","run","dev"]

# Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# If you use Next.js standalone output, prefer copying .next/standalone
# Here we ship prod node_modules for reliability
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm","start"]

