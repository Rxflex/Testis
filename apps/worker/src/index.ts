import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { z } from 'zod'
import { prisma } from '@testis/database'
import { clickhouse, insertEvents, initializeClickHouse } from '@testis/analytics'

// Environment validation
const envSchema = z.object({
  REDIS_URL: z.string().default('redis://localhost:6379'),
  NODE_ENV: z.string().default('development'),
  BATCH_SIZE: z.string().default('1000'),
  BATCH_INTERVAL_MS: z.string().default('5000')
})

const env = envSchema.parse(process.env)

// Redis connection
const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3
})

// Event processing schema
const eventJobSchema = z.object({
  type: z.enum(['pageview', 'click', 'mousemove', 'scroll']),
  timestamp: z.number(),
  url: z.string(),
  visitor_id: z.string(),
  api_key: z.string(),
  domain: z.string(),
  user_agent: z.string().optional(),
  ip: z.string().optional(),
  received_at: z.number(),
  data: z.record(z.any()).optional()
})

type EventJob = z.infer<typeof eventJobSchema>

// Batch storage for ClickHouse writes
let eventBatch: (EventJob & {
  predicted_age_bucket?: string
  income_score?: number
  interests?: string[]
  geo_country?: string
  geo_city?: string
})[] = []
let lastBatchTime = Date.now()

// Process individual event
async function processEvent(job: EventJob): Promise<void> {
  try {
    // 1. Domain Discovery - check if domain exists in cache
    const domainExists = await redis.get(`domain:${job.domain}`)
    
    if (!domainExists) {
      console.log(`New domain discovered: ${job.domain}`)
      
      // Add to PostgreSQL domains table
      try {
        await prisma.domain.upsert({
          where: {
            hostname_project_id: {
              hostname: job.domain,
              project_id: 'default' // TODO: Get actual project_id from API key
            }
          },
          update: {},
          create: {
            hostname: job.domain,
            project_id: 'default', // TODO: Get actual project_id from API key
            verified: true
          }
        })
        
        // Update Redis cache
        await redis.set(`domain:${job.domain}`, '1', 'EX', 3600) // Cache for 1 hour
      } catch (error) {
        console.error('Error adding domain to database:', error)
        // Continue processing even if domain insertion fails
      }
    }

    // 2. Enrichment
    const enrichedEvent = await enrichEvent(job)
    
    // 3. Add to batch
    eventBatch.push(enrichedEvent)
    
    // 4. Check if we should flush batch
    const shouldFlush = 
      eventBatch.length >= parseInt(env.BATCH_SIZE) ||
      (Date.now() - lastBatchTime) >= parseInt(env.BATCH_INTERVAL_MS)
    
    if (shouldFlush) {
      await flushBatch()
    }

  } catch (error) {
    console.error('Error processing event:', error)
    throw error
  }
}

// Enrich event with additional data
async function enrichEvent(job: EventJob): Promise<EventJob & {
  predicted_age_bucket?: string
  income_score?: number
  interests?: string[]
  geo_country?: string
  geo_city?: string
}> {
  const enriched: EventJob & {
    predicted_age_bucket?: string
    income_score?: number
    interests?: string[]
    geo_country?: string
    geo_city?: string
  } = { ...job }

  // GeoIP enrichment (placeholder)
  if (job.ip) {
    // TODO: Implement GeoIP lookup
    // enriched.geo_country = await getCountryFromIP(job.ip)
    // enriched.geo_city = await getCityFromIP(job.ip)
  }

  // User-Agent parsing (placeholder)
  if (job.user_agent) {
    // TODO: Parse browser, OS, device type
  }

  // Age/Income scoring (placeholder)
  if (job.url) {
    // TODO: Implement ML-based age/income prediction
    // enriched.predicted_age_bucket = calculateAgeBucket(job.url, job.user_agent)
    // enriched.income_score = calculateIncomeScore(job.url, job.user_agent)
  }

  // Interest extraction (placeholder)
  if (job.url) {
    // TODO: Extract interests from URL patterns
    // enriched.interests = extractInterests(job.url)
  }

  return enriched
}

// Flush batch to ClickHouse
async function flushBatch(): Promise<void> {
  if (eventBatch.length === 0) return

  try {
    console.log(`Flushing batch of ${eventBatch.length} events to ClickHouse`)
    
    // Convert to ClickHouse format
    const clickhouseEvents = eventBatch.map(event => ({
      user_api_key: event.api_key,
      domain: event.domain,
      visitor_id: event.visitor_id,
      event_type: event.type,
      timestamp: event.timestamp,
      url: event.url,
      predicted_age_bucket: event.predicted_age_bucket || '',
      income_score: event.income_score || 0,
      interests: event.interests || [],
      geo_country: event.geo_country || '',
      geo_city: event.geo_city || '',
      user_agent: event.user_agent || '',
      ip: event.ip || '',
      data: event.data
    }))
    
    await insertEvents(clickhouseEvents)
    
    // Clear batch
    eventBatch = []
    lastBatchTime = Date.now()
    
    console.log('Batch flushed successfully')
  } catch (error) {
    console.error('Error flushing batch:', error)
    // TODO: Implement retry logic or dead letter queue
    throw error
  }
}

// Create worker
const worker = new Worker('events', async (job) => {
  const eventData = eventJobSchema.parse(job.data)
  await processEvent(eventData)
}, {
  connection: redis,
  concurrency: 10,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 }
})

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

worker.on('error', (err) => {
  console.error('Worker error:', err)
})

// Periodic batch flush (safety net)
setInterval(async () => {
  if (eventBatch.length > 0 && (Date.now() - lastBatchTime) >= parseInt(env.BATCH_INTERVAL_MS)) {
    await flushBatch()
  }
}, parseInt(env.BATCH_INTERVAL_MS))

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down worker gracefully...')
  
  // Flush remaining events
  await flushBatch()
  
  // Close worker
  await worker.close()
  await redis.quit()
  
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Initialize services
async function initialize() {
  try {
    // Initialize ClickHouse tables
    await initializeClickHouse()
    console.log('ClickHouse initialized successfully')
    
    // Test database connections
    await prisma.$connect()
    console.log('PostgreSQL connected successfully')
    
    console.log('Worker started, waiting for jobs...')
  } catch (error) {
    console.error('Failed to initialize worker:', error)
    process.exit(1)
  }
}

initialize()