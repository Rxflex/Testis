#!/bin/bash

echo "🌱 Seeding Testis with test data..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Seeding Redis with API keys...${NC}"

# Add test API keys to Redis
sudo docker exec testis-redis-1 redis-cli SET "api_key:test-api-key" "1" EX 86400
sudo docker exec testis-redis-1 redis-cli SET "api_key:demo-api-key" "1" EX 86400
sudo docker exec testis-redis-1 redis-cli SET "api_key:example-api-key" "1" EX 86400

echo -e "${GREEN}✅ API keys added to Redis${NC}"

echo -e "${BLUE}2. Seeding ClickHouse with test events...${NC}"

# Run the ClickHouse seeding script inside the web container
sudo docker exec testis-web-1 sh -c "cd /app && npm run seed-clickhouse"

echo -e "${GREEN}✅ ClickHouse seeded with test data${NC}"

echo -e "${BLUE}3. Verifying data...${NC}"

# Check Redis keys
echo "Redis API keys:"
sudo docker exec testis-redis-1 redis-cli KEYS "api_key:*"

# Check ClickHouse data
echo ""
echo "ClickHouse events count:"
curl -s "http://localhost:8125/" -d "SELECT count() FROM events" || echo "ClickHouse query failed"

echo ""
echo -e "${GREEN}🎉 Data seeding completed!${NC}"
echo ""
echo "You can now:"
echo "• Visit the dashboard: http://localhost:3003"
echo "• Test the collector: curl -X POST http://localhost:3001/collect -H 'x-api-key: test-api-key' -H 'Content-Type: application/json' -d '{\"type\":\"pageview\",\"timestamp\":$(date +%s000),\"url\":\"https://example.com\",\"visitor_id\":\"test-visitor\"}'"