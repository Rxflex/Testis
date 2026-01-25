#!/bin/bash

echo "🧪 Testing Testis with Simplified Configuration"
echo "=============================================="

# Stop any running containers
echo "Stopping existing containers..."
docker-compose down
docker-compose -f docker-compose.simple.yml down

# Clean up
echo "Cleaning up..."
docker system prune -f

# Start with simplified config
echo "Starting with simplified configuration..."
docker-compose -f docker-compose.simple.yml up -d

# Wait for services
echo "Waiting for services to start..."
sleep 30

# Check status
echo "Checking container status..."
docker-compose -f docker-compose.simple.yml ps

echo ""
echo "Checking ClickHouse logs..."
docker-compose -f docker-compose.simple.yml logs clickhouse | tail -20

echo ""
echo "Testing ClickHouse connectivity..."
curl -s http://localhost:8125/ping && echo "✅ ClickHouse HTTP OK" || echo "❌ ClickHouse HTTP Failed"

echo ""
echo "Testing Collector..."
curl -s http://localhost:3001/health && echo "✅ Collector OK" || echo "❌ Collector Failed"

echo ""
echo "If this works, we can update the main docker-compose.yml"