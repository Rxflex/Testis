#!/bin/bash

echo "🔄 Full Restart of Testis Analytics Platform"
echo "============================================"

# Stop all containers
echo "1. Stopping all containers..."
sudo docker compose down
sudo docker compose -f docker-compose.full.yml down
sudo docker compose -f docker-compose.simple.yml down

# Remove all containers and networks
echo "2. Cleaning up containers and networks..."
sudo docker container prune -f
sudo docker network prune -f

# Remove old images to force rebuild
echo "3. Removing old images..."
sudo docker image prune -f

# Build and start with full configuration
echo "4. Building and starting services..."
sudo docker compose -f docker-compose.full.yml up -d --build

# Wait for services to initialize
echo "5. Waiting for services to initialize..."
sleep 30

# Check status
echo "6. Checking service status..."
sudo docker compose -f docker-compose.full.yml ps

echo ""
echo "7. Testing ClickHouse connectivity..."
sleep 10
curl -s http://localhost:8125/ping && echo "✅ ClickHouse OK" || echo "❌ ClickHouse Failed"

echo ""
echo "✅ Full restart complete!"
echo "Run './deploy-check.sh' to verify all services."