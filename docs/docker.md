# Docker Build for Minden

This document describes the Docker containerization setup for the Minden application, including both development and production environments.

## Overview

The project includes:
- **Development container** (`minden:dev`) - For local development with hot reloading
- **Production container** (`minden:prod`) - Optimized build for production deployment
- **GitHub Actions workflow** - Automated building and publishing of containers

## Files

### Dockerfiles
- `dockerfile.dev` - Development environment with hot reloading
- `dockerfile.prod` - Production environment with optimized build

### Docker Compose
- `docker-compose.yml` - Database setup for development
- `docker-compose.app.yml` - Full application stack for testing containers

### Build Scripts
- `build-docker.sh` - Local build script for both containers
- `.github/workflows/docker-build.yml` - CI/CD pipeline for automated builds

## GitHub Action

The GitHub Action workflow automatically:

1. **Triggers on:**
   - Push to main branch
   - Pull requests to main branch
   - Manual workflow dispatch

2. **Builds two containers:**
   - `ghcr.io/ethancls/minden:dev` - Development version
   - `ghcr.io/ethancls/minden:prod` - Production version
   - `ghcr.io/ethancls/minden:latest` - Latest production version (main branch only)

3. **Features:**
   - Multi-platform builds (AMD64 + ARM64)
   - GitHub Container Registry publishing
   - Build cache optimization
   - Proper tagging based on branch/PR

## Local Usage

### Build containers locally:
```bash
# Make script executable
chmod +x build-docker.sh

# Build both containers
./build-docker.sh
```

### Run containers:
```bash
# Development (with hot reloading)
docker run -p 3000:3000 minden:dev

# Production (optimized)
docker run -p 3000:3000 minden:prod
```

### Use with database:
```bash
# Start database
docker-compose up -d postgres

# Run development version with database
docker-compose -f docker-compose.app.yml --profile dev up

# Run production version with database
docker-compose -f docker-compose.app.yml --profile prod up
```

## Container Registry

The GitHub Action publishes containers to GitHub Container Registry (ghcr.io):

- `ghcr.io/ethancls/minden:dev` - Latest development build
- `ghcr.io/ethancls/minden:prod` - Latest production build
- `ghcr.io/ethancls/minden:latest` - Alias for latest production build

### Pull and run published containers:
```bash
# Pull from registry
docker pull ghcr.io/ethancls/minden:prod

# Run
docker run -p 3000:3000 ghcr.io/ethancls/minden:prod
```

## Environment Variables

The containers are configured to skip environment validation during build:
- Development: Uses `SKIP_ENV_VALIDATION=true` in runtime
- Production: Uses `SKIP_ENV_VALIDATION=true` during build and runtime

For production deployment, you'll need to provide the required environment variables as documented in `src/env.js`.

## Architecture

### Development Container (`minden:dev`)
- Based on Node.js 22 Alpine
- Includes hot reloading via `npm run dev`
- Exposes ports 3000 (app) and 4983 (Drizzle Studio)
- Runs database migrations on startup

### Production Container (`minden:prod`)
- Multi-stage build for optimization
- Standalone Next.js output
- Minimal runtime footprint
- Runs as non-root user for security

## GitHub Actions Details

The workflow uses:
- `docker/setup-buildx-action@v3` - Multi-platform builds
- `docker/login-action@v3` - Registry authentication
- `docker/metadata-action@v5` - Tag generation
- `docker/build-push-action@v5` - Build and push
- GitHub Actions cache for faster builds

## Troubleshooting

### Build Issues
- Ensure Docker is installed and running
- Check network connectivity for npm package downloads
- Verify environment variables are set correctly

### Runtime Issues
- Check that required ports (3000, 5432) are available
- Ensure database is running and accessible
- Verify environment variables are properly configured

## Security

- Production containers run as non-root user (`nextjs`)
- Secrets are handled via GitHub Actions secrets
- Container registry authentication via GitHub tokens
- Multi-platform builds ensure compatibility