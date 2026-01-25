import * as React from "react"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts'
import { format } from 'date-fns'
import { cn } from "../../lib/utils"

interface TrafficData {
  hour: string
  visitors: number
  pageviews: number
  clicks: number
}

interface TrafficChartProps {
  data: TrafficData[]
  className?: string
  height?: number
}

// Custom tooltip with glassmorphism effect
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">
          {format(new Date(label), 'MMM d, HH:mm')}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.dataKey}:</span>
            <span className="font-medium tabular-nums">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function TrafficChart({ data, className, height = 200 }: TrafficChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
          />
          <XAxis 
            dataKey="hour"
            tickFormatter={(value) => format(new Date(value), 'HH:mm')}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="visitors" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="pageviews" 
            stroke="hsl(142 76% 36%)" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "hsl(142 76% 36%)", strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            stroke="hsl(47 96% 53%)" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "hsl(47 96% 53%)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}