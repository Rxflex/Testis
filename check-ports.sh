#!/bin/bash

echo "🔍 Checking Port Usage"
echo "====================="

# Install ss if not available (replacement for netstat)
if ! command -v ss &> /dev/null; then
    echo "Installing ss (socket statistics)..."
    sudo apt update && sudo apt install -y iproute2
fi

echo ""
echo "Checking ports used by Testis:"
echo "------------------------------"

ports=(3000 3001 5432 6379 8123 8124 8125 9000 9001 9002)

for port in "${ports[@]}"; do
    echo -n "Port $port: "
    if ss -tuln | grep -q ":$port "; then
        echo "❌ OCCUPIED"
        echo "  Process: $(ss -tulpn | grep ":$port " | head -1)"
    else
        echo "✅ FREE"
    fi
done

echo ""
echo "Docker containers using these ports:"
echo "-----------------------------------"
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E "(3000|3001|5432|6379|8123|8124|8125|9000|9001|9002)"

echo ""
echo "Recommended action:"
echo "- Stop any conflicting services"
echo "- Or use different ports in docker-compose.yml"