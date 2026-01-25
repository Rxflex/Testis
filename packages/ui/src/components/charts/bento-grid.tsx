import * as React from "react"
import { cn } from "../../lib/utils"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid auto-rows-[192px] grid-cols-1 gap-4 md:grid-cols-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoGrid.displayName = "BentoGrid"

interface BentoGridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  span?: "1" | "2" | "3"
}

const BentoGridItem = React.forwardRef<HTMLDivElement, BentoGridItemProps>(
  ({ className, children, span = "1", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-md transition-shadow",
          span === "2" && "md:col-span-2",
          span === "3" && "md:col-span-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoGridItem.displayName = "BentoGridItem"

export { BentoGrid, BentoGridItem }