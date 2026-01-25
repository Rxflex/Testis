import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Settings, 
  Globe,
  Activity
} from 'lucide-react'
import { cn } from '@testis/ui'

const navigation = [
  { name: 'Overview', href: '/', icon: BarChart3 },
  { name: 'Visitors', href: '/visitors', icon: Users },
  { name: 'Heatmaps', href: '/heatmaps', icon: MousePointer },
  { name: 'Domains', href: '/domains', icon: Globe },
  { name: 'Realtime', href: '/realtime', icon: Activity },
  { name: 'Install Script', href: '/install', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col w-64 bg-card border-r border-border">
      <div className="p-6">
        <h1 className="text-xl font-semibold">Testis Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          High-Performance Analytics
        </p>
      </div>
      
      <div className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            All systems operational
          </div>
          <div>Last updated: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </nav>
  )
}