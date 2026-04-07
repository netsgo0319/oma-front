import { useState, useCallback } from "react"
import { Play, PlayCircle, Clock, Loader2, CheckCircle2, XCircle, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dmsPipelineSteps } from "@/data/db-migration"

type StepStatus = "waiting" | "running" | "completed" | "failed"

interface PipelineStepData {
  name: string
  description: string
  status: StepStatus
  duration: string
  logs: string[]
}

const statusConfig: Record<StepStatus, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  waiting: { icon: Clock, label: "대기", color: "text-muted-foreground", bg: "bg-muted/30" },
  running: { icon: Loader2, label: "실행 중", color: "text-info", bg: "bg-info/10" },
  completed: { icon: CheckCircle2, label: "완료", color: "text-success", bg: "bg-success/10" },
  failed: { icon: XCircle, label: "실패", color: "text-destructive", bg: "bg-destructive/10" },
}

export default function DmsExecutionPage() {
  const [steps, setSteps] = useState<PipelineStepData[]>(
    dmsPipelineSteps.map((s) => ({
      ...s,
      status: s.status === "completed" ? "completed" : "waiting",
    })) as PipelineStepData[]
  )
  const [selectedStep, setSelectedStep] = useState(0)
  const [isRunningAll, setIsRunningAll] = useState(false)

  const runStep = useCallback((index: number) => {
    setSteps((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], status: "running" }
      return next
    })
    setSelectedStep(index)

    setTimeout(() => {
      setSteps((prev) => {
        const next = [...prev]
        next[index] = {
          ...next[index],
          status: "completed",
          duration: `${Math.floor(Math.random() * 30 + 5)}m ${Math.floor(Math.random() * 59)}s`,
        }
        return next
      })
    }, 2000)
  }, [])

  const runAll = useCallback(() => {
    setIsRunningAll(true)
    const waitingIndices = steps
      .map((s, i) => (s.status === "waiting" ? i : -1))
      .filter((i) => i >= 0)

    waitingIndices.forEach((idx, seqIdx) => {
      setTimeout(() => {
        setSteps((prev) => {
          const next = [...prev]
          next[idx] = { ...next[idx], status: "running" }
          return next
        })
        setSelectedStep(idx)
      }, seqIdx * 2500)

      setTimeout(() => {
        setSteps((prev) => {
          const next = [...prev]
          next[idx] = {
            ...next[idx],
            status: "completed",
            duration: `${Math.floor(Math.random() * 30 + 5)}m ${Math.floor(Math.random() * 59)}s`,
          }
          return next
        })
        if (seqIdx === waitingIndices.length - 1) setIsRunningAll(false)
      }, seqIdx * 2500 + 2000)
    })
  }, [steps])

  const completedCount = steps.filter((s) => s.status === "completed").length
  const totalCount = steps.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">DMS 스키마 변환</h2>
          <p className="text-muted-foreground mt-1">
            AWS DMS 기반 6단계 스키마 변환 파이프라인
          </p>
        </div>
        <Button
          onClick={runAll}
          disabled={isRunningAll || completedCount === totalCount}
          size="lg"
          className="gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          전체 실행
        </Button>
      </div>

      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-success transition-all duration-500 rounded-full"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {completedCount} / {totalCount} 단계 완료
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline steps */}
        <div className="lg:col-span-1 space-y-3">
          {steps.map((step, idx) => {
            const config = statusConfig[step.status]
            const Icon = config.icon
            const isSelected = selectedStep === idx

            return (
              <button
                key={step.name}
                onClick={() => setSelectedStep(idx)}
                className={cn(
                  "w-full text-left rounded-lg border-2 p-4 transition-all hover:shadow-md",
                  isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/30",
                  config.bg
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                      step.status === "completed"
                        ? "border-success bg-success/20"
                        : step.status === "running"
                          ? "border-info bg-info/20"
                          : step.status === "failed"
                            ? "border-destructive bg-destructive/20"
                            : "border-muted-foreground/30 bg-muted"
                    )}
                  >
                    {step.status === "waiting" ? (
                      <span className="text-sm font-bold text-muted-foreground">{idx + 1}</span>
                    ) : (
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          config.color,
                          step.status === "running" && "animate-spin"
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{step.name}</p>
                      <Badge
                        variant={
                          step.status === "completed"
                            ? "success"
                            : step.status === "running"
                              ? "default"
                              : step.status === "failed"
                                ? "destructive"
                                : "secondary"
                        }
                        className="shrink-0"
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    {step.status !== "waiting" && (
                      <p className="text-xs text-muted-foreground mt-1">소요: {step.duration}</p>
                    )}
                  </div>
                </div>
                {step.status === "waiting" && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        runStep(idx)
                      }}
                      disabled={isRunningAll}
                    >
                      <Play className="h-3 w-3" />
                      실행
                    </Button>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Log viewer */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                로그 뷰어 - Step {selectedStep + 1}: {steps[selectedStep].name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted dark:bg-secondary p-4 font-mono text-sm text-foreground max-h-[600px] overflow-y-auto space-y-1">
              {dmsPipelineSteps[selectedStep].logs.map((log, i) => (
                <div
                  key={i}
                  className={cn(
                    "leading-relaxed",
                    log.includes("[WARN]") && "text-yellow-400",
                    log.includes("[ERROR]") && "text-red-400",
                    log.includes("[INFO]") && "text-green-400"
                  )}
                >
                  <span className="text-muted-foreground mr-2">
                    {`${String(i + 1).padStart(2, "0")}>`}
                  </span>
                  {log}
                </div>
              ))}
              {steps[selectedStep].status === "running" && (
                <div className="flex items-center gap-2 text-blue-400 mt-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>처리 중...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
