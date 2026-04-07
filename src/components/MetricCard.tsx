import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    direction: "up" | "down" | "neutral"
    percentage: number
  }
  className?: string
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className }: MetricCardProps) {
  const trendConfig = {
    up: { icon: TrendingUp, color: "text-success" },
    down: { icon: TrendingDown, color: "text-destructive" },
    neutral: { icon: Minus, color: "text-muted-foreground" },
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trendConfig[trend.direction].color)}>
                  {(() => {
                    const TrendIcon = trendConfig[trend.direction].icon
                    return <TrendIcon className="h-3 w-3" />
                  })()}
                  {trend.percentage}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
