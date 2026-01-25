'use client'

import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Skeleton } from "@testis/ui"
import { 
  MousePointer, 
  Eye, 
  Activity,
  Move,
  Monitor,
  Smartphone,
  Filter
} from "lucide-react"
import { useState } from "react"

function HeatmapPreview({ title, type, loading }: { title: string; type: 'click' | 'move' | 'scroll'; loading: boolean }) {
  const getGradient = (type: string) => {
    switch (type) {
      case 'click':
        return 'from-red-500/30 via-orange-500/20 to-yellow-500/10'
      case 'move':
        return 'from-blue-500/30 via-purple-500/20 to-pink-500/10'
      case 'scroll':
        return 'from-green-500/30 via-teal-500/20 to-blue-500/10'
      default:
        return 'from-gray-500/30 via-gray-400/20 to-gray-300/10'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {type === 'click' && <MousePointer className="h-4 w-4" />}
          {type === 'move' && <MousePointer className="h-4 w-4" />}
          {type === 'scroll' && <Move className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full rounded-md" />
        ) : (
          <div className={`h-48 bg-gradient-to-br ${getGradient(type)} rounded-md border-2 border-dashed border-border/50 flex flex-col items-center justify-center relative overflow-hidden`}>
            {/* Simulated heatmap dots */}
            <div className="absolute inset-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    type === 'click' ? 'bg-red-500/60' :
                    type === 'move' ? 'bg-blue-500/60' : 'bg-green-500/60'
                  }`}
                  style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 70 + 15}%`,
                    transform: `scale(${Math.random() * 0.8 + 0.5})`
                  }}
                />
              ))}
            </div>
            <div className="text-center z-10">
              <div className="text-2xl font-semibold tabular-nums mb-1">
                {type === 'click' ? '1,234' : type === 'move' ? '5,678' : '3,456'}
              </div>
              <div className="text-xs text-muted-foreground">
                {type === 'click' ? 'Click Events' : type === 'move' ? 'Mouse Movements' : 'Scroll Events'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PageHeatmaps({ loading }: { loading: boolean }) {
  const pages = [
    { url: '/home', clicks: 1234, moves: 5678, scrolls: 3456 },
    { url: '/products', clicks: 987, moves: 4321, scrolls: 2345 },
    { url: '/about', clicks: 654, moves: 3210, scrolls: 1678 },
    { url: '/contact', clicks: 432, moves: 2109, scrolls: 1234 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Heatmaps</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <div key={page.url} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{page.url}</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold tabular-nums text-red-600">
                      {page.clicks.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold tabular-nums text-blue-600">
                      {page.moves.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Moves</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold tabular-nums text-green-600">
                      {page.scrolls.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Scrolls</div>
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

function DeviceHeatmaps({ loading }: { loading: boolean }) {
  const devices = [
    { name: 'Desktop', icon: Monitor, sessions: 1456, avgClicks: 12.3 },
    { name: 'Mobile', icon: Smartphone, sessions: 1123, avgClicks: 8.7 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
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
                    {device.sessions.toLocaleString()} sessions
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {device.avgClicks} avg clicks
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

export default function HeatmapsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [selectedPage, setSelectedPage] = useState('/home')
  const loading = false // Since we don't have real heatmap data yet

  return (
    <>
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Heatmap Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Visual representation of user interactions on your website
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* Page Selector */}
              <select 
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="px-3 py-1 text-sm bg-background border border-border rounded-md"
              >
                <option value="/home">Home Page</option>
                <option value="/products">Products</option>
                <option value="/about">About</option>
                <option value="/contact">Contact</option>
              </select>

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
          </div>

          {/* Heatmap Types Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <HeatmapPreview title="Click Heatmap" type="click" loading={loading} />
            <HeatmapPreview title="Mouse Movement" type="move" loading={loading} />
            <HeatmapPreview title="Scroll Heatmap" type="scroll" loading={loading} />
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PageHeatmaps loading={loading} />
            <DeviceHeatmaps loading={loading} />
          </div>

          {/* Info Card */}
          <Card className="mt-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <MousePointer className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Heatmap Data Collection
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Heatmaps are generated from real user interactions. Mouse movements are throttled to 1 event per 100ms 
                    and batched for optimal performance. Click data shows the most interacted elements on your pages.
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