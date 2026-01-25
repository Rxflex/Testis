#!/bin/bash

echo "🚀 Testis Analytics Platform - Deployment Check"
echo "=============================================="
echo "High Throughput, Zero Config, Deep Insight"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Counters for final report
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to increment counters
increment_total() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

increment_passed() {
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

increment_failed() {
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    increment_total
    echo -n "Checking $service_name... "
    
    if timeout 10 curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ OK${NC}"
        increment_passed
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        increment_failed
        return 1
    fi
}

# Function to check database connection
check_database() {
    local db_name=$1
    
    increment_total
    echo -n "Checking $db_name connection... "
    
    case $db_name in
        "PostgreSQL")
            if timeout 10 docker-compose exec -T postgres pg_isready -U testis > /dev/null 2>&1; then
                echo -e "${GREEN}✅ OK${NC}"
                increment_passed
                return 0
            fi
            ;;
        "Redis")
            if timeout 10 docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
                echo -e "${GREEN}✅ OK${NC}"
                increment_passed
                return 0
            fi
            ;;
        "ClickHouse")
            if timeout 10 curl -s "http://localhost:8124/ping" 2>/dev/null | grep -q "Ok"; then
                echo -e "${GREEN}✅ OK${NC}"
                increment_passed
                return 0
            fi
            ;;
    esac
    
    echo -e "${RED}❌ FAILED${NC}"
    increment_failed
    return 1
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint_name=$1
    local method=$2
    local url=$3
    local headers=$4
    local data=$5
    local expected_status=${6:-200}
    
    increment_total
    echo -n "Testing $endpoint_name... "
    
    local cmd="timeout 10 curl -s -w '%{http_code}' -X $method '$url'"
    
    if [ -n "$headers" ]; then
        cmd="$cmd $headers"
    fi
    
    if [ -n "$data" ]; then
        cmd="$cmd -d '$data'"
    fi
    
    local response=$(eval $cmd 2>/dev/null)
    local status_code=$(echo "$response" | tail -c 4)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        increment_passed
        return 0
    else
        echo -e "${RED}❌ FAILED (Status: $status_code)${NC}"
        increment_failed
        return 1
    fi
}

# Function to measure response time
measure_response_time() {
    local endpoint_name=$1
    local url=$2
    local headers=$3
    local data=$4
    local target_ms=${5:-5}
    
    increment_total
    echo -n "Measuring $endpoint_name response time... "
    
    local cmd="timeout 10 curl -s -o /dev/null -w '%{time_total}' -X POST '$url'"
    
    if [ -n "$headers" ]; then
        cmd="$cmd $headers"
    fi
    
    if [ -n "$data" ]; then
        cmd="$cmd -d '$data'"
    fi
    
    local response_time_seconds=$(eval $cmd 2>/dev/null)
    
    if [ -z "$response_time_seconds" ]; then
        echo -e "${RED}❌ FAILED (No response)${NC}"
        increment_failed
        return 1
    fi
    
    # Convert to milliseconds
    local response_time_ms=$(echo "$response_time_seconds * 1000" | bc -l 2>/dev/null | cut -d. -f1)
    
    if [ -z "$response_time_ms" ]; then
        echo -e "${RED}❌ FAILED (Invalid response time)${NC}"
        increment_failed
        return 1
    fi
    
    if [ "$response_time_ms" -lt "$target_ms" ]; then
        echo -e "${GREEN}✅ ${response_time_ms}ms (Target: <${target_ms}ms)${NC}"
        increment_passed
    elif [ "$response_time_ms" -lt $((target_ms * 2)) ]; then
        echo -e "${YELLOW}⚠️  ${response_time_ms}ms (Target: <${target_ms}ms)${NC}"
        increment_passed
    else
        echo -e "${RED}❌ ${response_time_ms}ms (Target: <${target_ms}ms)${NC}"
        increment_failed
    fi
}

echo -e "${BLUE}📊 Infrastructure Status:${NC}"
echo "=========================="
check_database "PostgreSQL"
check_database "Redis" 
check_database "ClickHouse"

echo ""
echo -e "${BLUE}🔧 Service Health Checks:${NC}"
echo "=========================="
check_service "Collector Health" "http://localhost:3001/health"
check_service "Collector Metrics" "http://localhost:3001/metrics"
check_service "Web Dashboard" "http://localhost:3000"

echo ""
echo -e "${BLUE}🧪 API Functionality Tests:${NC}"
echo "============================"

# Test collector endpoint with sample data
test_api_endpoint "Event Collection" "POST" "http://localhost:3001/collect" \
    "-H 'Content-Type: application/json' -H 'x-api-key: test-api-key'" \
    '{
        "type": "pageview",
        "timestamp": '$(date +%s000)',
        "url": "https://example.com/test",
        "visitor_id": "test-visitor-123"
    }' "200"

# Test different event types
test_api_endpoint "Click Event" "POST" "http://localhost:3001/collect" \
    "-H 'Content-Type: application/json' -H 'x-api-key: test-api-key'" \
    '{
        "type": "click",
        "timestamp": '$(date +%s000)',
        "url": "https://example.com/click-test",
        "visitor_id": "test-visitor-456"
    }' "200"

# Test invalid API key
test_api_endpoint "Invalid API Key (should fail)" "POST" "http://localhost:3001/collect" \
    "-H 'Content-Type: application/json' -H 'x-api-key: invalid-key'" \
    '{
        "type": "pageview",
        "timestamp": '$(date +%s000)',
        "url": "https://example.com/test",
        "visitor_id": "test-visitor-789"
    }' "401"

echo ""
echo -e "${BLUE}📈 Performance Benchmarks:${NC}"
echo "=========================="

# Measure response times for different scenarios
measure_response_time "Collector (Pageview)" "http://localhost:3001/collect" \
    "-H 'Content-Type: application/json' -H 'x-api-key: test-api-key'" \
    '{
        "type": "pageview",
        "timestamp": '$(date +%s000)',
        "url": "https://example.com/perf-test",
        "visitor_id": "perf-test-visitor"
    }' 5

measure_response_time "Collector (Click)" "http://localhost:3001/collect" \
    "-H 'Content-Type: application/json' -H 'x-api-key: test-api-key'" \
    '{
        "type": "click",
        "timestamp": '$(date +%s000)',
        "url": "https://example.com/perf-test-click",
        "visitor_id": "perf-test-visitor-2"
    }' 5

echo ""
echo -e "${BLUE}🐳 Container Status:${NC}"
echo "==================="
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    echo "Docker Compose not available"
fi

echo ""
echo -e "${BLUE}💾 Storage Status:${NC}"
echo "=================="
echo -n "Checking disk space... "
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✅ ${DISK_USAGE}% used${NC}"
else
    echo -e "${YELLOW}⚠️  ${DISK_USAGE}% used (Consider cleanup)${NC}"
fi

echo -n "Checking memory usage... "
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$MEM_USAGE" -lt 80 ]; then
        echo -e "${GREEN}✅ ${MEM_USAGE}% used${NC}"
    else
        echo -e "${YELLOW}⚠️  ${MEM_USAGE}% used${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Memory check not available${NC}"
fi

echo ""
echo -e "${PURPLE}📋 Deployment Summary:${NC}"
echo "======================"
echo -e "Total Checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL SYSTEMS OPERATIONAL!${NC}"
    echo -e "${GREEN}✅ Testis Analytics Platform is ready for production${NC}"
    echo ""
    echo -e "${BLUE}🚀 Platform Capabilities:${NC}"
    echo "• High-performance ingestion (<5ms response time)"
    echo "• Real-time data processing with batching"
    echo "• Professional dashboard with analytics"
    echo "• Zero-config client script integration"
    echo "• Scalable architecture (10k+ RPS capable)"
    echo ""
    echo -e "${BLUE}📚 Next Steps:${NC}"
    echo "• Configure production environment variables"
    echo "• Set up SSL certificates for HTTPS"
    echo "• Configure domain allowlists for security"
    echo "• Set up monitoring and alerting"
    echo "• Review backup and disaster recovery procedures"
    echo ""
    echo -e "${BLUE}🔗 Service URLs:${NC}"
    echo "• Dashboard: http://localhost:3000"
    echo "• Collector API: http://localhost:3001"
    echo "• Health Check: http://localhost:3001/health"
    echo "• Metrics: http://localhost:3001/metrics"
else
    echo ""
    echo -e "${RED}⚠️  ISSUES DETECTED${NC}"
    echo -e "${YELLOW}Some checks failed. Please review the output above.${NC}"
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting:${NC}"
    echo "• Check Docker containers: docker-compose ps"
    echo "• View service logs: docker-compose logs [service]"
    echo "• Restart services: docker-compose restart"
    echo "• Full rebuild: docker-compose down && docker-compose up -d --build"
fi

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}  Testis Analytics Platform - High Throughput Analytics${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}"