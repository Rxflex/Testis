#!/bin/bash

echo "🚀 Testing Testis Deployment..."

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.full.yml down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker-compose -f docker-compose.full.yml down --rmi all

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.full.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to initialize..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.full.yml ps

# Test collector health endpoint
echo "🔍 Testing collector health..."
curl -f http://localhost:3001/health || echo "❌ Collector health check failed"

# Test web app
echo "🔍 Testing web app..."
curl -f http://localhost:3003 || echo "❌ Web app health check failed"

# Show logs for debugging
echo "📋 Recent logs:"
docker-compose -f docker-compose.full.yml logs --tail=20

echo "✅ Deployment test complete!"