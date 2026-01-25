#!/usr/bin/env tsx

import { z } from 'zod'

const envSchema = z.object({
  COLLECTOR_URL: z.string().default('http://localhost:3001'),
  API_KEY: z.string().default('test_key_12345'),
  CONCURRENT_REQUESTS: z.string().default('100'),
  TOTAL_REQUESTS: z.string().default('1000'),
  REQUEST_DELAY_MS: z.string().default('10')
})

const env = envSchema.parse(process.env)

interface TestResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  requestsPerSecond: number
  testDuration: number
}

async function sendRequest(): Promise<{ success: boolean; responseTime: number }> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${env.COLLECTOR_URL}/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': env.API_KEY,
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        type: 'pageview',
        timestamp: Date.now(),
        url: 'http://localhost:3000/test',
        visitor_id: `visitor_${Math.random().toString(36).substr(2, 9)}`,
        data: {
          page_title: 'Load Test Page',
          referrer: 'http://localhost:3000'
        }
      })
    })
    
    const responseTime = Date.now() - startTime
    return { success: response.ok, responseTime }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    return { success: false, responseTime }
  }
}

async function runLoadTest(): Promise<TestResult> {
  const concurrentRequests = parseInt(env.CONCURRENT_REQUESTS)
  const totalRequests = parseInt(env.TOTAL_REQUESTS)
  const requestDelay = parseInt(env.REQUEST_DELAY_MS)
  
  console.log('🚀 Starting load test...')
  console.log(`📊 Configuration:`)
  console.log(`   - Target: ${env.COLLECTOR_URL}`)
  console.log(`   - Total requests: ${totalRequests}`)
  console.log(`   - Concurrent requests: ${concurrentRequests}`)
  console.log(`   - Request delay: ${requestDelay}ms`)
  console.log('')
  
  const startTime = Date.now()
  let completedRequests = 0
  let successfulRequests = 0
  let failedRequests = 0
  const responseTimes: number[] = []
  
  // Progress tracking
  const progressInterval = setInterval(() => {
    const progress = (completedRequests / totalRequests * 100).toFixed(1)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    process.stdout.write(`\r⏳ Progress: ${progress}% (${completedRequests}/${totalRequests}) - ${elapsed}s elapsed`)
  }, 1000)
  
  // Execute requests in batches
  for (let i = 0; i < totalRequests; i += concurrentRequests) {
    const batchSize = Math.min(concurrentRequests, totalRequests - i)
    const batch = Array(batchSize).fill(null).map(() => sendRequest())
    
    const results = await Promise.all(batch)
    
    results.forEach(result => {
      completedRequests++
      responseTimes.push(result.responseTime)
      
      if (result.success) {
        successfulRequests++
      } else {
        failedRequests++
      }
    })
    
    // Small delay between batches to avoid overwhelming the server
    if (requestDelay > 0 && i + concurrentRequests < totalRequests) {
      await new Promise(resolve => setTimeout(resolve, requestDelay))
    }
  }
  
  clearInterval(progressInterval)
  process.stdout.write('\n')
  
  const testDuration = (Date.now() - startTime) / 1000
  const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const minResponseTime = Math.min(...responseTimes)
  const maxResponseTime = Math.max(...responseTimes)
  const requestsPerSecond = totalRequests / testDuration
  
  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime,
    minResponseTime,
    maxResponseTime,
    requestsPerSecond,
    testDuration
  }
}

async function main() {
  try {
    // Check if collector is running
    console.log('🔍 Checking collector health...')
    const healthResponse = await fetch(`${env.COLLECTOR_URL}/health`)
    
    if (!healthResponse.ok) {
      throw new Error(`Collector health check failed: ${healthResponse.status}`)
    }
    
    const healthData = await healthResponse.json()
    console.log('✅ Collector is healthy')
    console.log(`   - Status: ${healthData.status}`)
    console.log(`   - Redis: ${healthData.redis}`)
    console.log('')
    
    // Run load test
    const results = await runLoadTest()
    
    // Display results
    console.log('📈 Load Test Results:')
    console.log('=' .repeat(50))
    console.log(`Total Requests:       ${results.totalRequests}`)
    console.log(`Successful Requests:  ${results.successfulRequests} (${(results.successfulRequests/results.totalRequests*100).toFixed(1)}%)`)
    console.log(`Failed Requests:      ${results.failedRequests} (${(results.failedRequests/results.totalRequests*100).toFixed(1)}%)`)
    console.log(`Test Duration:        ${results.testDuration.toFixed(2)}s`)
    console.log(`Requests/Second:      ${results.requestsPerSecond.toFixed(2)} RPS`)
    console.log('')
    console.log('⏱️  Response Times:')
    console.log(`Average:              ${results.averageResponseTime.toFixed(2)}ms`)
    console.log(`Minimum:              ${results.minResponseTime}ms`)
    console.log(`Maximum:              ${results.maxResponseTime}ms`)
    console.log('')
    
    // Performance assessment
    if (results.averageResponseTime < 5) {
      console.log('🎉 EXCELLENT: Average response time is under 5ms target!')
    } else if (results.averageResponseTime < 10) {
      console.log('✅ GOOD: Average response time is acceptable')
    } else {
      console.log('⚠️  WARNING: Average response time exceeds target')
    }
    
    if (results.requestsPerSecond > 1000) {
      console.log('🚀 HIGH THROUGHPUT: Achieving 1000+ RPS')
    }
    
    if (results.failedRequests === 0) {
      console.log('💯 PERFECT: No failed requests!')
    }
    
  } catch (error) {
    console.error('❌ Load test failed:', error)
    process.exit(1)
  }
}

main()