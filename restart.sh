#!/bin/bash

echo "🔄 Restarting Testis Analytics Platform..."
echo "=========================================="

# Stop all containers
echo "Stopping containers..."
docker-compose down

# Remove old images to force rebuild
echo "Cleaning up old images..."
docker-compose build --no-cache

# Start services
echo "Starting services..."
docker-compose up -d

# Wait a bit for services to start
echo "Waiting for services to initialize..."
sleep 10

# Check status
echo "Checking service status..."
docker-compose ps

echo ""
echo "✅ Restart complete!"
echo "Run './deploy-check.sh' to verify all services are working correctly."