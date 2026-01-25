#!/bin/bash

echo "🧪 Testing Testis API and Data Flow"
echo "==================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Adding test API keys to Redis...${NC}"

# Add test API keys to Redis
sudo docker exec testis-redis-1 redis-cli SET "api_key:test-api-key" "1" EX 86400
sudo docker exec testis-redis-1 redis-cli SET "api_key:demo-api-key" "1" EX 86400
sudo docker exec testis-redis-1 redis-cli SET "api_key:example-api-key" "1" EX 86400

echo -e "${GREEN}✅ API keys added${NC}"

echo -e "${BLUE}2. Testing collector endpoint...${NC}"

# Test collector with valid API key
response=$(curl -s -w "%{http_code}" -X POST "http://localhost:3001/collect" \
    -H "Content-Type: application/json" \
    -H "x-api-key: test-api-key" \
    -d '{
        "type": "pageview",
        "timestamp": '$(date +%s000)',
        "url": "https://example.com/test",
        "visitor_id": "test-visitor-123"
    }')

status_code=$(echo "$response" | tail -c 4)
if [ "$status_code" = "200" ]; then
    echo -e "${GREEN}✅ Collector API working${NC}"
else
    echo -e "${RED}❌ Collector API failed (Status: $status_code)${NC}"
fi

echo -e "${BLUE}3. Sending multiple test events...${NC}"

# Send various types of events
for i in {1..10}; do
    curl -s -X POST "http://localhost:3001/collect" \
        -H "Content-Type: application/json" \
        -H "x-api-key: test-api-key" \
        -d '{
            "type": "pageview",
            "timestamp": '$(date +%s000)',
            "url": "https://example.com/page'$i'",
            "visitor_id": "visitor_'$i'"
        }' > /dev/null
    
    curl -s -X POST "http://localhost:3001/collect" \
        -H "Content-Type: application/json" \
        -H "x-api-key: test-api-key" \
        -d '{
            "type": "click",
            "timestamp": '$(date +%s000)',
            "url": "https://example.com/page'$i'",
            "visitor_id": "visitor_'$i'"
        }' > /dev/null
done

echo -e "${GREEN}✅ Sent 20 test events${NC}"

echo -e "${BLUE}4. Checking Redis queue...${NC}"
queue_length=$(sudo docker exec testis-redis-1 redis-cli LLEN "bull:events:waiting")
echo "Events in queue: $queue_length"

echo -e "${BLUE}5. Waiting for worker to process events...${NC}"
sleep 10

echo -e "${BLUE}6. Checking ClickHouse data...${NC}"
event_count=$(curl -s "http://localhost:8125/" -d "SELECT count() FROM events" 2>/dev/null || echo "0")
echo "Events in ClickHouse: $event_count"

echo -e "${BLUE}7. Testing web dashboard API...${NC}"
dashboard_response=$(curl -s "http://localhost:3003/api/analytics/overview?timeRange=24h")
if echo "$dashboard_response" | grep -q "overview"; then
    echo -e "${GREEN}✅ Dashboard API working${NC}"
    if echo "$dashboard_response" | grep -q "isMockData"; then
        echo -e "${BLUE}ℹ️  Using mock data (normal if no real data yet)${NC}"
    else
        echo -e "${GREEN}✅ Using real data from ClickHouse${NC}"
    fi
else
    echo -e "${RED}❌ Dashboard API failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 API Testing Complete!${NC}"
echo ""
echo "Next steps:"
echo "• Visit dashboard: http://localhost:3003"
echo "• Check collector health: http://localhost:3001/health"
echo "• Check collector metrics: http://localhost:3001/metrics"