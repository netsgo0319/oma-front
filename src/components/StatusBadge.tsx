import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "waiting" | "running" | "completed" | "failed"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { icon: React.ElementType; label: string; classes: string }> = {
  waiting: {
    icon: Clock,
    label: "Waiting",
    classes: "bg-muted text-muted-foreground",
  },
  running: {
    icon: Loader2,
    label: "Running",
    classes: "bg-info/20 text-info",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    classes: "bg-success/20 text-success",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    classes: "bg-destructive/20 text-destructive",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", status === "running" && "animate-spin")} />
      {config.label}
    </span>
  )
}
