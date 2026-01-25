'use client'

import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Skeleton } from "@testis/ui"
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer,
  Globe,
  Clock,
  TrendingUp,
  MapPin
} from "lucide-react"
import { useState, useEffect } from "react"

function RealtimeMetrics({ data, loading }: { data: any; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Active Visitors</p>
              {loading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums text-green-900 dark:text-green-100">
                  {data?.activeVisitors || 0}
                </p>
              )}
            </div>
            <Activity className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Page Views/min</p>
              {loading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {data?.pageViewsPerMinute || 0}
                </p>
              )}
            </div>
            <Eye className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Events/min</p>
              {loading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {data?.eventsPerMinute || 0}
                </p>
              )}
            </div>
            <MousePointer className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Session</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {data?.avgSessionDuration || '0m 0s'}
                </p>
              )}
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ActivePages({ loading }: { loading: boolean }) {
  const [pages, setPages] = useState([
    { url: '/home', visitors: 12, views: 18 },
    { url: '/products', visitors: 8, views: 15 },
    { url: '/about', visitors: 5, views: 7 },
    { url: '/contact', visitors: 3, views: 4 },
    { url: '/pricing', visitors: 2, views: 3 }
  ])

  // Simulate real-time updates
  useEffect(() => {
    if (loading) return

    const interval = setInterval(() => {
      setPages(prev => prev.map(page => ({
        ...page,
        visitors: Math.max(0, page.visitors + Math.floor(Math.random() * 3) - 1),
        views: Math.max(0, page.views + Math.floor(Math.random() * 4) - 1)
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [loading])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Active Pages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page, index) => (
              <div key={page.url} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{page.url}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold tabular-nums">{page.visitors}</div>
                    <div className="text-xs text-muted-foreground">visitors</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold tabular-nums">{page.views}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RealtimeEvents({ loading }: { loading: boolean }) {
  const [events, setEvents] = useState<Array<{
    id: string
    type: string
    page: string
    country: string
    timestamp: Date
  }>>([])

  // Simulate real-time events
  useEffect(() => {
    if (loading) return

    const eventTypes = ['pageview', 'click', 'scroll']
    const pages = ['/home', '/products', '/about', '/contact']
    const countries = ['US', 'UK', 'DE', 'FR', 'CA']

    const interval = setInterval(() => {
      const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        timestamp: new Date()
      }

      setEvents(prev => [newEvent, ...prev.slice(0, 19)]) // Keep last 20 events
    }, 2000)

    return () => clearInterval(interval)
  }, [loading])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pageview': return <Eye className="h-3 w-3" />
      case 'click': return <MousePointer className="h-3 w-3" />
      case 'scroll': return <Activity className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'pageview': return 'text-blue-600'
      case 'click': return 'text-red-600'
      case 'scroll': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Live Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Waiting for events...</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                  <div className={`p-1.5 rounded-full bg-muted ${getEventColor(event.type)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium capitalize">
                      {event.type} on {event.page}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.country} • {event.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopCountries({ loading }: { loading: boolean }) {
  const countries = [
    { name: 'United States', code: 'US', visitors: 12 },
    { name: 'United Kingdom', code: 'UK', visitors: 8 },
    { name: 'Germany', code: 'DE', visitors: 5 },
    { name: 'France', code: 'FR', visitors: 3 },
    { name: 'Canada', code: 'CA', visitors: 2 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Active Countries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-6 rounded" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {countries.map((country) => (
              <div key={country.code} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-muted rounded-sm flex items-center justify-center text-xs">
                    {country.code}
                  </div>
                  <span className="text-sm font-medium">{country.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {country.visitors}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function RealtimePage() {
  const loading = false
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Update timestamp every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const mockData = {
    activeVisitors: 30,
    pageViewsPerMinute: 45,
    eventsPerMinute: 127,
    avgSessionDuration: '2m 34s'
  }

  return (
    <>
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Realtime Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Live visitor activity and events on your website
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live • Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Realtime Metrics */}
          <RealtimeMetrics data={mockData} loading={loading} />

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ActivePages loading={loading} />
            <TopCountries loading={loading} />
          </div>

          {/* Live Events - Full Width */}
          <RealtimeEvents loading={loading} />

          {/* Info Card */}
          <Card className="mt-6 border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
                    Realtime Data Collection
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    This page shows visitors and events from the last 5 minutes. Data updates automatically 
                    every few seconds. Active visitors are those who have generated events in the last 5 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}