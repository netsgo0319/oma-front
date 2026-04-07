import { useState, useCallback } from "react"
import { Clock, Loader2, CheckCircle2, XCircle, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type StepStatus = "waiting" | "running" | "completed" | "failed"

interface PipelineStep {
  name: string
  status: StepStatus
  duration?: string
}

interface PipelineStepsProps {
  steps: PipelineStep[]
  className?: string
}

const statusConfig: Record<StepStatus, { icon: React.ElementType; color: string; lineColor: string }> = {
  waiting: { icon: Clock, color: "text-muted-foreground border-muted", lineColor: "bg-muted" },
  running: { icon: Loader2, color: "text-info border-info", lineColor: "bg-info" },
  completed: { icon: CheckCircle2, color: "text-success border-success", lineColor: "bg-success" },
  failed: { icon: XCircle, color: "text-destructive border-destructive", lineColor: "bg-destructive" },
}

export function PipelineSteps({ steps: initialSteps, className }: PipelineStepsProps) {
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps)

  const advanceStep = useCallback(() => {
    setSteps((prev) => {
      const next = [...prev]
      const runningIdx = next.findIndex((s) => s.status === "running")

      if (runningIdx >= 0) {
        next[runningIdx] = { ...next[runningIdx], status: "completed", duration: "3.2s" }
        if (runningIdx + 1 < next.length) {
          next[runningIdx + 1] = { ...next[runningIdx + 1], status: "running" }
        }
      } else {
        const firstWaiting = next.findIndex((s) => s.status === "waiting")
        if (firstWaiting >= 0) {
          next[firstWaiting] = { ...next[firstWaiting], status: "running" }
        }
      }

      return next
    })
  }, [])

  const hasWaitingOrRunning = steps.some((s) => s.status === "waiting" || s.status === "running")

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const config = statusConfig[step.status]
          const Icon = config.icon
          const isLast = idx === steps.length - 1

          return (
            <div key={step.name} className="flex items-stretch gap-3">
              <div className="flex flex-col items-center">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2", config.color)}>
                  <Icon className={cn("h-4 w-4", step.status === "running" && "animate-spin")} />
                </div>
                {!isLast && (
                  <div className={cn("w-0.5 flex-1 min-h-6", step.status === "completed" ? config.lineColor : "bg-muted")} />
                )}
              </div>
              <div className="flex flex-1 items-start justify-between pb-6">
                <div>
                  <p className={cn("text-sm font-medium", step.status === "waiting" ? "text-muted-foreground" : "text-foreground")}>
                    {step.name}
                  </p>
                  {step.duration && (
                    <p className="text-xs text-muted-foreground">{step.duration}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {hasWaitingOrRunning && (
        <Button size="sm" onClick={advanceStep} className="gap-1.5">
          <Play className="h-3.5 w-3.5" />
          Advance Step
        </Button>
      )}
    </div>
  )
}
