#!/bin/bash

echo "🌱 Seeding ClickHouse with test data and testing the system..."

# Check if ClickHouse is running
echo "🔍 Checking ClickHouse connection..."
docker exec testis-clickhouse-1 clickhouse-client --query "SELECT 1" || {
    echo "❌ ClickHouse is not accessible"
    exit 1
}

echo "✅ ClickHouse is running"

# Seed ClickHouse with test data
echo "📊 Seeding ClickHouse with test data..."
docker exec testis-web-1 sh -c "cd /app && node -e \"
const { clickhouse } = require('./packages/analytics/dist/index.js');

async function seed() {
  console.log('Seeding ClickHouse...');
  
  // Generate test events
  const events = [];
  const now = new Date();
  const domains = ['example.com', 'test.com', 'demo.com'];
  const eventTypes = ['pageview', 'click', 'scroll'];
  const ageBuckets = ['18-24', '25-34', '35-44', '45-54', '55+'];
  
  // Generate events for last 7 days
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const eventTime = new Date(now.getTime() - (day * 24 + hour) * 60 * 60 * 1000);
      const eventsPerHour = Math.floor(Math.random() * 20) + 5;
      
      for (let i = 0; i < eventsPerHour; i++) {
        events.push({
          user_api_key: 'test-api-key',
          domain: domains[Math.floor(Math.random() * domains.length)],
          visitor_id: \`visitor_\${Math.floor(Math.random() * 100)}\`,
          event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          timestamp: new Date(eventTime.getTime() + Math.random() * 60 * 60 * 1000),
          url: \`https://example.com/page/\${Math.floor(Math.random() * 10)}\`,
          predicted_age_bucket: ageBuckets[Math.floor(Math.random() * ageBuckets.length)],
          income_score: Math.floor(Math.random() * 100),
          interests: ['tech', 'business'],
          geo_country: 'US',
          geo_city: 'New York',
          user_agent: 'Mozilla/5.0 (Test Browser)',
          ip: '192.168.1.100',
          data: ''
        });
      }
    }
  }
  
  console.log(\`Generated \${events.length} test events\`);
  
  // Insert in batches
  const batchSize = 500;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    await clickhouse.insert({
      table: 'events',
      values: batch,
      format: 'JSONEachRow'
    });
    console.log(\`Inserted batch \${Math.floor(i / batchSize) + 1}/\${Math.ceil(events.length / batchSize)}\`);
  }
  
  // Verify
  const result = await clickhouse.query({
    query: 'SELECT count() as total FROM events',
    format: 'JSONEachRow'
  });
  const data = await result.json();
  console.log(\`Total events: \${data[0]?.total || 0}\`);
  console.log('Seeding completed!');
}

seed().catch(console.error);
\""

echo "✅ Test data seeded successfully"

# Test the analytics API
echo "🧪 Testing analytics API..."
curl -s "http://localhost:3003/api/analytics/overview?timeRange=7d" | head -20

echo ""
echo "🎉 System test completed!"
echo ""
echo "📋 Next steps:"
echo "1. Visit http://localhost:3003 to see the dashboard"
echo "2. Check the analytics data is displaying correctly"
echo "3. Monitor logs: docker-compose -f docker-compose.full.yml logs -f"