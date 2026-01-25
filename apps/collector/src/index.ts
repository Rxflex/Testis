import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Queue } from 'bullmq'
import Redis from 'ioredis'
import { z } from 'zod'

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
})

// Environment validation
const envSchema = z.object({
  PORT: z.string().default('3001'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  NODE_ENV: z.string().default('development'),
  MAX_PAYLOAD_SIZE: z.string().default('1048576') // 1MB
})

const env = envSchema.parse(process.env)

// Redis connection with retry logic
const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000
})

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message)
})

redis.on('ready', () => {
  console.log('🚀 Redis ready for operations')
})

// BullMQ Queue for events
const eventQueue = new Queue('events', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
})

// Event payload validation
const eventSchema = z.object({
  type: z.enum(['pageview', 'click', 'mousemove', 'scroll']),
  timestamp: z.number(),
  url: z.string().url(),
  visitor_id: z.string().min(1),
  data: z.record(z.any()).optional()
})

// Performance metrics
let requestCount = 0
let totalResponseTime = 0
let errorCount = 0

// Register CORS with specific origins for production
server.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? (origin, callback) => {
        // TODO: Implement dynamic origin validation from database
        callback(null, true)
      }
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
})

// Request size limit
server.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const json = JSON.parse(body as string)
    done(null, json)
  } catch (err) {
    done(err as Error, undefined)
  }
})

// Health check endpoint with detailed status
server.get('/health', async (request, reply) => {
  const startTime = Date.now()
  
  try {
    // Check Redis connectivity
    await redis.ping()
    
    const responseTime = Date.now() - startTime
    const avgResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0
    
    return {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      redis: 'connected',
      queue: {
        waiting: await eventQueue.getWaiting().then(jobs => jobs.length),
        active: await eventQueue.getActive().then(jobs => jobs.length),
        completed: await eventQueue.getCompleted().then(jobs => jobs.length),
        failed: await eventQueue.getFailed().then(jobs => jobs.length)
      },
      metrics: {
        requests: requestCount,
        errors: errorCount,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        errorRate: requestCount > 0 ? (errorCount / requestCount * 100).toFixed(2) + '%' : '0%'
      },
      checkTime: responseTime
    }
  } catch (error) {
    reply.code(503)
    return {
      status: 'unhealthy',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
      redis: 'disconnected'
    }
  }
})

// Performance metrics endpoint
server.get('/metrics', async () => {
  return {
    requests: requestCount,
    errors: errorCount,
    avgResponseTime: requestCount > 0 ? totalResponseTime / requestCount : 0,
    errorRate: requestCount > 0 ? errorCount / requestCount : 0,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: Date.now()
  }
})

// Main event ingestion endpoint
server.post('/collect', async (request, reply) => {
  const startTime = process.hrtime.bigint()
  requestCount++
  
  try {
    // Extract API key from header
    const apiKey = request.headers['x-api-key'] as string
    if (!apiKey) {
      errorCount++
      reply.code(401)
      return { error: 'Missing API key' }
    }

    // Quick Redis check for API key validity (cached)
    let isValidKey: string | null = null
    try {
      isValidKey = await redis.get(`api_key:${apiKey}`)
    } catch (redisError) {
      // If Redis is down, log but don't fail the request
      console.error('Redis error during API key validation:', redisError)
      
      // In production, you might want to fail fast here
      if (process.env.NODE_ENV === 'production') {
        errorCount++
        reply.code(503)
        return { error: 'Service temporarily unavailable' }
      }
      
      // In development, allow requests to continue
      console.warn('⚠️  Redis unavailable, allowing request in development mode')
    }
    
    if (!isValidKey && process.env.NODE_ENV === 'production') {
      errorCount++
      reply.code(401)
      return { error: 'Invalid API key' }
    }

    // Validate payload
    const payload = eventSchema.parse(request.body)
    
    // Extract origin domain
    const origin = request.headers.origin || request.headers.referer
    const domain = origin ? new URL(origin).hostname : 'unknown'

    // Enqueue for processing (fire & forget)
    try {
      await eventQueue.add('process-event', {
        ...payload,
        api_key: apiKey,
        domain,
        user_agent: request.headers['user-agent'],
        ip: request.ip,
        received_at: Date.now()
      }, {
        priority: payload.type === 'pageview' ? 1 : 2 // Prioritize pageviews
      })
    } catch (queueError) {
      console.error('Queue error:', queueError)
      errorCount++
      reply.code(503)
      return { error: 'Unable to process request' }
    }

    // Calculate response time
    const endTime = process.hrtime.bigint()
    const responseTime = Number(endTime - startTime) / 1000000 // Convert to ms
    totalResponseTime += responseTime

    reply.code(200)
    return { 
      success: true,
      response_time_ms: Math.round(responseTime * 100) / 100
    }

  } catch (error) {
    errorCount++
    
    if (error instanceof z.ZodError) {
      reply.code(400)
      return { 
        error: 'Invalid payload',
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    
    server.log.error(error)
    reply.code(500)
    return { error: 'Internal server error' }
  }
})

// Graceful shutdown
const gracefulShutdown = async () => {
  server.log.info('Shutting down gracefully...')
  await eventQueue.close()
  await redis.quit()
  await server.close()
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Start server
const start = async () => {
  try {
    await server.listen({ 
      port: parseInt(env.PORT), 
      host: '0.0.0.0' 
    })
    server.log.info(`Collector running on port ${env.PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()