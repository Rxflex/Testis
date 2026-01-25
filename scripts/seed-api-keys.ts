#!/usr/bin/env tsx

import { prisma } from '@testis/database'
import Redis from 'ioredis'
import { z } from 'zod'

// Environment validation
const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379')
})

const env = envSchema.parse(process.env)

async function seedApiKeys() {
  const redis = new Redis(env.REDIS_URL)
  
  try {
    console.log('🌱 Seeding API keys...')
    
    // Create a test user if not exists
    const testUser = await prisma.user.upsert({
      where: { email: 'test@testis.dev' },
      update: {},
      create: {
        email: 'test@testis.dev',
        name: 'Test User',
        api_key: 'test_key_12345'
      }
    })
    
    // Create a test project
    const testProject = await prisma.project.upsert({
      where: { id: 'test_project_1' },
      update: {},
      create: {
        id: 'test_project_1',
        name: 'Test Project',
        description: 'Development test project',
        user_id: testUser.id
      }
    })
    
    // Create test domains
    await prisma.domain.upsert({
      where: {
        hostname_project_id: {
          hostname: 'localhost',
          project_id: testProject.id
        }
      },
      update: {},
      create: {
        hostname: 'localhost',
        project_id: testProject.id,
        verified: true
      }
    })
    
    await prisma.domain.upsert({
      where: {
        hostname_project_id: {
          hostname: 'example.com',
          project_id: testProject.id
        }
      },
      update: {},
      create: {
        hostname: 'example.com',
        project_id: testProject.id,
        verified: true
      }
    })
    
    // Cache API keys in Redis
    console.log('💾 Caching API keys in Redis...')
    
    const apiKeys = await prisma.user.findMany({
      select: { api_key: true, id: true }
    })
    
    for (const user of apiKeys) {
      await redis.set(`api_key:${user.api_key}`, user.id, 'EX', 86400) // 24 hours
      console.log(`✅ Cached API key: ${user.api_key}`)
    }
    
    // Cache domains in Redis
    console.log('💾 Caching domains in Redis...')
    
    const domains = await prisma.domain.findMany({
      where: { verified: true },
      select: { hostname: true }
    })
    
    for (const domain of domains) {
      await redis.set(`domain:${domain.hostname}`, '1', 'EX', 3600) // 1 hour
      console.log(`✅ Cached domain: ${domain.hostname}`)
    }
    
    console.log('🎉 Seeding completed successfully!')
    console.log(`📊 Created ${apiKeys.length} API keys and ${domains.length} domains`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await redis.quit()
  }
}

seedApiKeys()