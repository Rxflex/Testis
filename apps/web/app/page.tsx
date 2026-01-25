'use client'

import { Navigation } from "../components/navigation"
import { BentoGrid, BentoGridItem } from "@testis/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Skeleton } from "@testis/ui"
import { TrafficChart } from "@testis/ui"
import { 
  Users, 
  MousePointer, 
  Eye, 
  TrendingUp, 
  Globe, 
  Clock,
  BarChart3,
  Activity,
  AlertCircle
} from "lucide-react"
import { useAnalytics } from "../lib/hooks/use-analytics"
import { useState } from "react"

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  loading = false
}: { 
  title: string
  value: string | number
  change?: string
  icon: any
  loading?: boolean
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
            )}
            {change && !loading && (
              <p className="text-xs text-green-600 font-medium">
                {change}
              </p>
            )}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

function RealtimeCard({ visitors, loading }: { visitors: number; loading: boolean }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          Realtime Visitors
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <Skeleton className="h-9 w-12 mb-2" />
        ) : (
          <div className="text-3xl font-semibold tabular-nums mb-2">
            {visitors}
          </div>
        )}
        <div className="text-xs text-muted-foreground">
          Active in the last 5 minutes
        </div>
      </CardContent>
    </Card>
  )
}

function TopDomainsCard({ domains, loading }: { domains: any[]; loading: boolean }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Top Domains</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))
        ) : domains.length > 0 ? (
          domains.slice(0, 3).map((domain, index) => (
            <div key={domain.domain} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">{domain.domain}</span>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">
                {domain.visitors.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No domain data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrafficOverviewCard({ data, loading }: { data: any[]; loading: boolean }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Traffic Overview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : data.length > 0 ? (
          <TrafficChart data={data} height={128} />
        ) : (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mr-2" />
            <span className="text-sm">No traffic data available</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DemographicsCard({ demographics, loading }: { demographics: any[]; loading: boolean }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Demographics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : demographics.length > 0 ? (
          <div className="space-y-2">
            {demographics.map((demo) => {
              const percentage = ((demo.count / demographics.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(0)
              return (
                <div key={demo.ageBucket} className="flex justify-between text-sm">
                  <span>{demo.ageBucket}</span>
                  <span className="tabular-nums">{percentage}%</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No demographic data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function HeatmapPreview() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Heatmap Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-32 bg-gradient-to-br from-red-500/20 via-yellow-500/20 to-green-500/20 rounded-md flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Heatmap visualization</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ error }: { error: string }) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Error loading analytics data</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const { data, loading, error } = useAnalytics({ timeRange })

  const formatChange = (current: number, previous: number) => {
    if (previous === 0) return '+100%'
    const change = ((current - previous) / previous * 100).toFixed(1)
    return `${change.startsWith('-') ? '' : '+'}${change}% from last period`
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
                Analytics Overview
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time insights and user profiling data
                {data?.isMockData && (
                  <span className="ml-2 text-amber-600">• Using mock data</span>
                )}
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

          {/* Error State */}
          {error && (
            <div className="mb-6">
              <ErrorCard error={error} />
            </div>
          )}

          {/* Bento Grid Layout */}
          <BentoGrid className="mb-8">
            {/* Key Metrics Row */}
            <BentoGridItem>
              <MetricCard
                title="Total Visitors"
                value={data?.overview.uniqueVisitors.toLocaleString() || 0}
                change={!loading ? "+12.5% from last week" : undefined}
                icon={Users}
                loading={loading}
              />
            </BentoGridItem>
            
            <BentoGridItem>
              <MetricCard
                title="Page Views"
                value={data?.overview.pageviews.toLocaleString() || 0}
                change={!loading ? "+8.3% from last week" : undefined}
                icon={Eye}
                loading={loading}
              />
            </BentoGridItem>
            
            <BentoGridItem>
              <MetricCard
                title="Click Events"
                value={data?.overview.clicks.toLocaleString() || 0}
                change={!loading ? "+15.7% from last week" : undefined}
                icon={MousePointer}
                loading={loading}
              />
            </BentoGridItem>

            {/* Realtime Visitors */}
            <BentoGridItem>
              <RealtimeCard 
                visitors={data?.overview.realtimeVisitors || 0} 
                loading={loading} 
              />
            </BentoGridItem>

            <BentoGridItem>
              <MetricCard
                title="Avg. Income Score"
                value={data?.overview.avgIncomeScore.toFixed(1) || '0.0'}
                change={!loading ? "+2.1% from last week" : undefined}
                icon={TrendingUp}
                loading={loading}
              />
            </BentoGridItem>

            <BentoGridItem>
              <MetricCard
                title="Total Events"
                value={data?.overview.totalEvents.toLocaleString() || 0}
                change={!loading ? "+18.2% from last week" : undefined}
                icon={Activity}
                loading={loading}
              />
            </BentoGridItem>

            {/* Traffic Chart - Spans 2 columns */}
            <BentoGridItem span="2">
              <TrafficOverviewCard 
                data={data?.trafficData || []} 
                loading={loading} 
              />
            </BentoGridItem>

            {/* Top Domains */}
            <BentoGridItem>
              <TopDomainsCard 
                domains={data?.topDomains || []} 
                loading={loading} 
              />
            </BentoGridItem>

            {/* Heatmap Preview - Spans 2 columns */}
            <BentoGridItem span="2">
              <HeatmapPreview />
            </BentoGridItem>

            {/* Demographics */}
            <BentoGridItem>
              <DemographicsCard 
                demographics={data?.demographics || []} 
                loading={loading} 
              />
            </BentoGridItem>
          </BentoGrid>

          {/* Status Footer */}
          <div className="text-center text-xs text-muted-foreground">
            {data?.generatedAt ? (
              <>Last updated: {new Date(data.generatedAt).toLocaleTimeString()}</>
            ) : (
              <>Loading...</>
            )}
            {' • '}
            Data refreshes every 30 seconds
          </div>
        </div>
      </main>
    </>
  )
}