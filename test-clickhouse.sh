#!/bin/bash

echo "🔍 Testing ClickHouse Connection"
echo "==============================="

echo "1. Testing external connection (port 8125)..."
if curl -s http://localhost:8125/ping | grep -q "Ok"; then
    echo "✅ External connection OK"
else
    echo "❌ External connection FAILED"
fi

echo ""
echo "2. Testing internal connection..."
if sudo docker exec testis-clickhouse-1 wget --spider -q http://localhost:8123/ping 2>/dev/null; then
    echo "✅ Internal connection OK"
else
    echo "❌ Internal connection FAILED"
fi

echo ""
echo "3. Testing database creation..."
if curl -s "http://localhost:8125/" -d "SHOW DATABASES" | grep -q "testis"; then
    echo "✅ Database 'testis' exists"
else
    echo "❌ Database 'testis' not found"
fi

echo ""
echo "4. Container health status:"
sudo docker inspect testis-clickhouse-1 --format='{{.State.Health.Status}}'

echo ""
echo "5. Recent health check logs:"
sudo docker inspect testis-clickhouse-1 --format='{{range .State.Health.Log}}{{.Output}}{{end}}' | tail -3