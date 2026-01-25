import { useState, useEffect } from 'react'

interface AnalyticsOverview {
  totalEvents: number
  uniqueVisitors: number
  pageviews: number
  clicks: number
  avgIncomeScore: number
  realtimeVisitors: number
}

interface TopDomain {
  domain: string
  visitors: number
  events: number
}

interface TrafficData {
  hour: string
  visitors: number
  pageviews: number
  clicks: number
}

interface Demographics {
  ageBucket: string
  count: number
  avgIncome: number
}

interface AnalyticsData {
  overview: AnalyticsOverview
  topDomains: TopDomain[]
  trafficData: TrafficData[]
  demographics: Demographics[]
  timeRange: string
  generatedAt: string
  isMockData?: boolean
}

interface UseAnalyticsOptions {
  timeRange?: '24h' | '7d' | '30d' | '90d'
  domain?: string
  refreshInterval?: number
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { timeRange = '7d', domain, refreshInterval = 30000 } = options
  
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(domain && { domain })
      })

      const response = await fetch(`/api/analytics/overview?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up refresh interval
    const interval = setInterval(fetchData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [timeRange, domain, refreshInterval])

  return {
    data,
    loading,
    error,
    refresh: fetchData
  }
}