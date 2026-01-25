import { createClient } from '@clickhouse/client'
import { z } from 'zod'

// Environment validation
const envSchema = z.object({
  CLICKHOUSE_URL: z.string().default('http://localhost:8125'),
  CLICKHOUSE_DATABASE: z.string().default('testis'),
  CLICKHOUSE_USERNAME: z.string().default('testis'),
  CLICKHOUSE_PASSWORD: z.string().default('testis_password')
})

const env = envSchema.parse(process.env)

// ClickHouse client
export const clickhouse = createClient({
  host: env.CLICKHOUSE_URL,
  database: env.CLICKHOUSE_DATABASE,
  username: env.CLICKHOUSE_USERNAME,
  password: env.CLICKHOUSE_PASSWORD
})

// Event schema for ClickHouse
export const eventSchema = z.object({
  user_api_key: z.string(),
  domain: z.string(),
  visitor_id: z.string(),
  event_type: z.enum(['pageview', 'click', 'mousemove', 'scroll']),
  timestamp: z.number(),
  url: z.string(),
  predicted_age_bucket: z.string().optional(),
  income_score: z.number().min(0).max(100).optional(),
  interests: z.array(z.string()).optional(),
  geo_country: z.string().optional(),
  geo_city: z.string().optional(),
  user_agent: z.string().optional(),
  ip: z.string().optional(),
  data: z.record(z.any()).optional()
})

// Heatmap schema for ClickHouse
export const heatmapSchema = z.object({
  user_api_key: z.string(),
  domain: z.string(),
  visitor_id: z.string(),
  session_id: z.string(),
  url: z.string(),
  timestamp: z.number(),
  x_coords: z.array(z.number()),
  y_coords: z.array(z.number()),
  viewport_w: z.number(),
  viewport_h: z.number()
})

export type Event = z.infer<typeof eventSchema>
export type Heatmap = z.infer<typeof heatmapSchema>

// Database initialization
export async function initializeClickHouse() {
  try {
    // Create database if not exists
    await clickhouse.command({
      query: `CREATE DATABASE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}`
    })

    // Create events table
    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}.events (
          user_api_key String,
          domain String,
          visitor_id String,
          event_type LowCardinality(String),
          timestamp DateTime64(3),
          url String,
          predicted_age_bucket LowCardinality(String),
          income_score UInt8,
          interests Array(String),
          geo_country LowCardinality(String),
          geo_city String,
          user_agent String,
          ip String,
          data String
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (user_api_key, domain, timestamp)
        SETTINGS index_granularity = 8192
      `
    })

    // Create heatmaps table
    await clickhouse.command({
      query: `
        CREATE TABLE IF NOT EXISTS ${env.CLICKHOUSE_DATABASE}.heatmaps (
          user_api_key String,
          domain String,
          visitor_id String,
          session_id String,
          url String,
          timestamp DateTime64(3),
          x_coords Array(UInt16),
          y_coords Array(UInt16),
          viewport_w UInt16,
          viewport_h UInt16
        ) ENGINE = MergeTree()
        PARTITION BY toYYYYMM(timestamp)
        ORDER BY (user_api_key, domain, timestamp)
        SETTINGS index_granularity = 8192
      `
    })

    console.log('ClickHouse tables initialized successfully')
  } catch (error) {
    console.error('Error initializing ClickHouse:', error)
    throw error
  }
}

// Batch insert events
export async function insertEvents(events: Event[]) {
  if (events.length === 0) return

  try {
    await clickhouse.insert({
      table: 'events',
      values: events.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp),
        data: event.data ? JSON.stringify(event.data) : ''
      })),
      format: 'JSONEachRow'
    })
  } catch (error) {
    console.error('Error inserting events:', error)
    throw error
  }
}

// Batch insert heatmaps
export async function insertHeatmaps(heatmaps: Heatmap[]) {
  if (heatmaps.length === 0) return

  try {
    await clickhouse.insert({
      table: 'heatmaps',
      values: heatmaps.map(heatmap => ({
        ...heatmap,
        timestamp: new Date(heatmap.timestamp)
      })),
      format: 'JSONEachRow'
    })
  } catch (error) {
    console.error('Error inserting heatmaps:', error)
    throw error
  }
}