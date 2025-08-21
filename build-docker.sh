#!/bin/bash

# Docker Build Script for Minden
# This script builds both development and production Docker images locally

set -e

echo "🐋 Building Minden Docker Images..."

# Get the current git commit hash for tagging
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "📝 Commit: $COMMIT_HASH"
echo "⏰ Timestamp: $TIMESTAMP"

# Build development image
echo "🔨 Building development image..."
docker build -f dockerfile.dev -t minden:dev -t minden:dev-$COMMIT_HASH -t minden:dev-$TIMESTAMP .

# Build production image
echo "🔨 Building production image..."
docker build -f dockerfile.prod -t minden:prod -t minden:prod-$COMMIT_HASH -t minden:prod-$TIMESTAMP .

echo "✅ Build complete!"
echo ""
echo "🏷️  Available images:"
echo "   - minden:dev (development)"
echo "   - minden:prod (production)"
echo ""
echo "🚀 To run:"
echo "   Development: docker run -p 3000:3000 minden:dev"
echo "   Production:  docker run -p 3000:3000 minden:prod"
echo ""
echo "📋 To view images: docker images | grep minden"