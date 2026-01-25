import { NextRequest, NextResponse } from 'next/server'
import { clickhouse } from '@testis/analytics'
import { z } from 'zod'

const querySchema = z.object({
  timeRange: z.enum(['24h', '7d', '30d', '90d']).default('7d'),
  domain: z.string().optional()
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { timeRange, domain } = querySchema.parse({
    timeRange: searchParams.get('timeRange') || '7d',
    domain: searchParams.get('domain') || undefined
  })

  try {
    // Calculate time range
    const now = new Date()
    const timeRangeHours = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
      '90d': 24 * 90
    }[timeRange]

    const startTime = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000)

    // Format timestamp for ClickHouse DateTime64(3) - use YYYY-MM-DD HH:MM:SS.sss format
    const formatTimestamp = (date: Date): string => {
      return date.toISOString().replace('T', ' ').replace('Z', '')
    }

    // Build base query conditions
    const domainCondition = domain ? `AND domain = '${domain}'` : ''
    
    // Get overview metrics
    const overviewQuery = `
      SELECT 
        count() as total_events,
        uniq(visitor_id) as unique_visitors,
        countIf(event_type = 'pageview') as pageviews,
        countIf(event_type = 'click') as clicks,
        avg(income_score) as avg_income_score
      FROM events 
      WHERE timestamp >= '${formatTimestamp(startTime)}'
      ${domainCondition}
    `

    const overviewResult = await clickhouse.query({
      query: overviewQuery,
      format: 'JSONEachRow'
    })

    const overviewData = await overviewResult.json() as any[]
    const overview = overviewData[0] || {
      total_events: 0,
      unique_visitors: 0,
      pageviews: 0,
      clicks: 0,
      avg_income_score: 0
    }

    // Get top domains
    const domainsQuery = `
      SELECT 
        domain,
        uniq(visitor_id) as visitors,
        count() as events
      FROM events 
      WHERE timestamp >= '${formatTimestamp(startTime)}'
      GROUP BY domain
      ORDER BY visitors DESC
      LIMIT 10
    `

    const domainsResult = await clickhouse.query({
      query: domainsQuery,
      format: 'JSONEachRow'
    })

    const topDomains = await domainsResult.json() as any[]

    // Get hourly traffic data for chart
    const trafficQuery = `
      SELECT 
        toStartOfHour(timestamp) as hour,
        uniq(visitor_id) as visitors,
        countIf(event_type = 'pageview') as pageviews,
        countIf(event_type = 'click') as clicks
      FROM events 
      WHERE timestamp >= '${formatTimestamp(startTime)}'
      ${domainCondition}
      GROUP BY hour
      ORDER BY hour
    `

    const trafficResult = await clickhouse.query({
      query: trafficQuery,
      format: 'JSONEachRow'
    })

    const trafficData = await trafficResult.json() as any[]

    // Get demographics data
    const demographicsQuery = `
      SELECT 
        predicted_age_bucket,
        count() as count,
        avg(income_score) as avg_income
      FROM events 
      WHERE timestamp >= '${formatTimestamp(startTime)}'
        AND predicted_age_bucket != ''
        ${domainCondition}
      GROUP BY predicted_age_bucket
      ORDER BY count DESC
    `

    const demographicsResult = await clickhouse.query({
      query: demographicsQuery,
      format: 'JSONEachRow'
    })

    const demographics = await demographicsResult.json() as any[]

    // Get realtime visitors (last 5 minutes)
    const realtimeQuery = `
      SELECT uniq(visitor_id) as realtime_visitors
      FROM events 
      WHERE timestamp >= now() - INTERVAL 5 MINUTE
      ${domainCondition}
    `

    const realtimeResult = await clickhouse.query({
      query: realtimeQuery,
      format: 'JSONEachRow'
    })

    const realtimeData = await realtimeResult.json() as any[]
    const realtimeVisitors = realtimeData[0]?.realtime_visitors || 0

    return NextResponse.json({
      overview: {
        totalEvents: parseInt(overview.total_events),
        uniqueVisitors: parseInt(overview.unique_visitors),
        pageviews: parseInt(overview.pageviews),
        clicks: parseInt(overview.clicks),
        avgIncomeScore: parseFloat(overview.avg_income_score) || 0,
        realtimeVisitors: parseInt(realtimeVisitors)
      },
      topDomains: topDomains.map((d: any) => ({
        domain: d.domain,
        visitors: parseInt(d.visitors),
        events: parseInt(d.events)
      })),
      trafficData: trafficData.map((t: any) => ({
        hour: t.hour,
        visitors: parseInt(t.visitors),
        pageviews: parseInt(t.pageviews),
        clicks: parseInt(t.clicks)
      })),
      demographics: demographics.map((d: any) => ({
        ageBucket: d.predicted_age_bucket,
        count: parseInt(d.count),
        avgIncome: parseFloat(d.avg_income) || 0
      })),
      timeRange,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    
    // Return proper error response instead of mock data
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'ANALYTICS_FETCH_ERROR'
      },
      { status: 500 }
    )
  }
}