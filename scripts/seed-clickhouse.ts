#!/usr/bin/env tsx

import { clickhouse, initializeClickHouse } from '@testis/analytics'

async function seedClickHouse() {
  console.log('🌱 Seeding ClickHouse with test data...')

  try {
    // Initialize ClickHouse tables
    await initializeClickHouse()
    console.log('✅ ClickHouse tables initialized')

    // Generate test data
    const domains = ['example.com', 'test.com', 'demo.com', 'mysite.com']
    const eventTypes = ['pageview', 'click', 'scroll', 'mousemove']
    const ageBuckets = ['18-24', '25-34', '35-44', '45-54', '55+']
    const apiKeys = ['test-api-key', 'demo-api-key', 'example-api-key']

    const events = []
    const now = new Date()

    // Generate events for the last 7 days
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const eventTime = new Date(now.getTime() - (day * 24 + hour) * 60 * 60 * 1000)
        
        // Generate 10-50 events per hour
        const eventsPerHour = Math.floor(Math.random() * 40) + 10
        
        for (let i = 0; i < eventsPerHour; i++) {
          const visitorId = `visitor_${Math.floor(Math.random() * 1000)}`
          const domain = domains[Math.floor(Math.random() * domains.length)]
          const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
          const ageBucket = ageBuckets[Math.floor(Math.random() * ageBuckets.length)]
          const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)]
          
          events.push({
            user_api_key: apiKey,
            domain: domain,
            visitor_id: visitorId,
            event_type: eventType,
            timestamp: new Date(eventTime.getTime() + Math.random() * 60 * 60 * 1000),
            url: `https://${domain}/${Math.random() > 0.5 ? 'page' : 'product'}/${Math.floor(Math.random() * 100)}`,
            predicted_age_bucket: ageBucket,
            income_score: Math.floor(Math.random() * 100),
            interests: ['tech', 'business', 'lifestyle'].slice(0, Math.floor(Math.random() * 3) + 1),
            geo_country: ['US', 'UK', 'CA', 'DE', 'FR'][Math.floor(Math.random() * 5)],
            geo_city: ['New York', 'London', 'Toronto', 'Berlin', 'Paris'][Math.floor(Math.random() * 5)],
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            data: JSON.stringify({ test: true })
          })
        }
      }
    }

    console.log(`📊 Generated ${events.length} test events`)

    // Insert events in batches
    const batchSize = 1000
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize)
      
      await clickhouse.insert({
        table: 'events',
        values: batch,
        format: 'JSONEachRow'
      })
      
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`)
    }

    // Generate some heatmap data
    const heatmaps = []
    for (let i = 0; i < 100; i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)]
      const visitorId = `visitor_${Math.floor(Math.random() * 100)}`
      
      // Generate coordinate arrays (simulating mouse movements)
      const numPoints = Math.floor(Math.random() * 20) + 5
      const xCoords = Array.from({ length: numPoints }, () => Math.floor(Math.random() * 1920))
      const yCoords = Array.from({ length: numPoints }, () => Math.floor(Math.random() * 1080))
      
      heatmaps.push({
        user_api_key: apiKeys[Math.floor(Math.random() * apiKeys.length)],
        domain: domain,
        visitor_id: visitorId,
        session_id: `session_${i}`,
        url: `https://${domain}/page/${Math.floor(Math.random() * 10)}`,
        timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        x_coords: xCoords,
        y_coords: yCoords,
        viewport_w: 1920,
        viewport_h: 1080
      })
    }

    await clickhouse.insert({
      table: 'heatmaps',
      values: heatmaps,
      format: 'JSONEachRow'
    })

    console.log(`🎯 Inserted ${heatmaps.length} heatmap records`)

    // Verify data
    const countResult = await clickhouse.query({
      query: 'SELECT count() as total FROM events',
      format: 'JSONEachRow'
    })
    
    const countData = await countResult.json() as any[]
    console.log(`📈 Total events in database: ${countData[0]?.total || 0}`)

    console.log('🎉 ClickHouse seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding ClickHouse:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedClickHouse()
}

export { seedClickHouse }