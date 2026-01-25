'use client'

import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Skeleton } from "@testis/ui"
import { 
  Users, 
  Globe, 
  Clock, 
  TrendingUp,
  MapPin,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"
import { useAnalytics } from "../../lib/hooks/use-analytics"
import { useState } from "react"

function VisitorMetrics({ data, loading }: { data: any; loading: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Visitors</p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {data?.overview.uniqueVisitors.toLocaleString() || 0}
                </p>
              )}
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New Visitors</p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {Math.floor((data?.overview.uniqueVisitors || 0) * 0.65).toLocaleString()}
                </p>
              )}
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Returning</p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">
                  {Math.floor((data?.overview.uniqueVisitors || 0) * 0.35).toLocaleString()}
                </p>
              )}
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Session</p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">2m 34s</p>
              )}
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GeographyCard({ loading }: { loading: boolean }) {
  const countries = [
    { name: 'United States', visitors: 1234, percentage: 45 },
    { name: 'United Kingdom', visitors: 567, percentage: 20 },
    { name: 'Germany', visitors: 345, percentage: 12 },
    { name: 'France', visitors: 234, percentage: 8 },
    { name: 'Canada', visitors: 123, percentage: 4 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Top Countries
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {countries.map((country) => (
              <div key={country.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-muted rounded-sm" />
                  <span className="text-sm font-medium">{country.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {country.visitors.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {country.percentage}%
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

function DeviceCard({ loading }: { loading: boolean }) {
  const devices = [
    { name: 'Desktop', icon: Monitor, visitors: 1456, percentage: 52 },
    { name: 'Mobile', icon: Smartphone, visitors: 1123, percentage: 40 },
    { name: 'Tablet', icon: Tablet, visitors: 234, percentage: 8 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Device Types
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <device.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{device.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">
                    {device.visitors.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {device.percentage}%
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

function DemographicsCard({ demographics, loading }: { demographics: any[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Age Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : demographics.length > 0 ? (
          <div className="space-y-3">
            {demographics.map((demo) => {
              const total = demographics.reduce((sum, d) => sum + d.count, 0)
              const percentage = total > 0 ? ((demo.count / total) * 100).toFixed(0) : 0
              return (
                <div key={demo.ageBucket} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{demo.ageBucket}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {demo.count.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {percentage}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No demographic data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function VisitorsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const { data, loading, error } = useAnalytics({ timeRange })

  return (
    <>
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Visitor Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Detailed insights about your website visitors
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['24h', '7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Visitor Metrics */}
          <VisitorMetrics data={data} loading={loading} />

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeographyCard loading={loading} />
            <DeviceCard loading={loading} />
            <DemographicsCard demographics={data?.demographics || []} loading={loading} />
            
            {/* Browser Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Top Browsers</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { name: 'Chrome', percentage: 68, visitors: 1890 },
                      { name: 'Safari', percentage: 18, visitors: 501 },
                      { name: 'Firefox', percentage: 8, visitors: 223 },
                      { name: 'Edge', percentage: 6, visitors: 167 }
                    ].map((browser) => (
                      <div key={browser.name} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{browser.name}</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold tabular-nums">
                            {browser.visitors.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {browser.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}