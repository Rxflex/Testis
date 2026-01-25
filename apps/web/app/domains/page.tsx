'use client'

import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@testis/ui"
import { Button } from "@testis/ui"
import { Skeleton } from "@testis/ui"
import { 
  Globe, 
  Plus, 
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Users,
  Eye,
  TrendingUp,
  Settings
} from "lucide-react"
import { useState } from "react"

function DomainCard({ domain, loading }: { domain: any; loading: boolean }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-5 w-32 mb-1" />
              ) : (
                <h3 className="font-semibold">{domain.hostname}</h3>
              )}
              <div className="flex items-center gap-2">
                {loading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <>
                    {domain.verified ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {domain.verified ? 'Verified' : 'Pending'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            {loading ? (
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-lg font-semibold tabular-nums">
                {domain.visitors?.toLocaleString() || '0'}
              </div>
            )}
            <div className="text-xs text-muted-foreground">Visitors</div>
          </div>
          <div className="text-center">
            {loading ? (
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-lg font-semibold tabular-nums">
                {domain.pageviews?.toLocaleString() || '0'}
              </div>
            )}
            <div className="text-xs text-muted-foreground">Pageviews</div>
          </div>
          <div className="text-center">
            {loading ? (
              <Skeleton className="h-6 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-lg font-semibold tabular-nums">
                {domain.events?.toLocaleString() || '0'}
              </div>
            )}
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            View Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddDomainCard() {
  const [showForm, setShowForm] = useState(false)
  const [domain, setDomain] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add domain logic
    console.log('Adding domain:', domain)
    setDomain('')
    setShowForm(false)
  }

  if (showForm) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Add Domain
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowForm(true)}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">Add New Domain</h3>
        <p className="text-sm text-muted-foreground">
          Start tracking analytics for a new website
        </p>
      </CardContent>
    </Card>
  )
}

function DomainStats({ loading }: { loading: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Domains</p>
              {loading ? (
                <Skeleton className="h-8 w-8 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">4</p>
              )}
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              {loading ? (
                <Skeleton className="h-8 w-8 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">3</p>
              )}
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Visitors</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums">2.8K</p>
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
              <p className="text-sm text-muted-foreground">Growth</p>
              {loading ? (
                <Skeleton className="h-8 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-semibold tabular-nums text-green-600">+12%</p>
              )}
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DomainsPage() {
  const loading = false
  
  // Mock domain data
  const domains = [
    {
      hostname: 'example.com',
      verified: true,
      visitors: 1234,
      pageviews: 5678,
      events: 9012
    },
    {
      hostname: 'test.com',
      verified: true,
      visitors: 987,
      pageviews: 3456,
      events: 6789
    },
    {
      hostname: 'demo.com',
      verified: true,
      visitors: 654,
      pageviews: 2345,
      events: 4567
    },
    {
      hostname: 'mysite.com',
      verified: false,
      visitors: 0,
      pageviews: 0,
      events: 0
    }
  ]

  return (
    <>
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Domain Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and monitor all your tracked domains
              </p>
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>

          {/* Domain Stats */}
          <DomainStats loading={loading} />

          {/* Domains Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <DomainCard key={i} domain={{}} loading={true} />
              ))
            ) : (
              <>
                {domains.map((domain) => (
                  <DomainCard key={domain.hostname} domain={domain} loading={false} />
                ))}
                <AddDomainCard />
              </>
            )}
          </div>

          {/* Setup Instructions */}
          <Card className="mt-8 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Domain Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  <strong>1. Add your domain:</strong> Click "Add Domain" and enter your website URL
                </p>
                <p>
                  <strong>2. Install tracking script:</strong> Copy the tracking script from the "Install Script" page
                </p>
                <p>
                  <strong>3. Verify domain:</strong> Add the script to your website and we'll automatically verify it
                </p>
                <p>
                  <strong>4. Start tracking:</strong> Once verified, analytics data will start appearing within minutes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}