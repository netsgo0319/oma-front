import { useState } from "react"
import {
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DiffViewer } from "@/components/DiffViewer"
import { agentPipeline, schemaConversions } from "@/data/db-migration"

type AgentStatus = "completed" | "running" | "pending"

const agentStatusConfig: Record<AgentStatus, { icon: React.ElementType; color: string; bg: string }> = {
  completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success" },
  running: { icon: Loader2, color: "text-info", bg: "bg-info/10 border-info" },
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted border-muted-foreground/30" },
}

export default function AiSchemaPage() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selected = schemaConversions[selectedIdx]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI 스키마 변환</h2>
        <p className="text-muted-foreground mt-1">
          AI 에이전트 파이프라인을 통한 스키마 변환 및 품질 평가
        </p>
      </div>

      {/* Agent pipeline - horizontal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">에이전트 파이프라인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {agentPipeline.steps.map((step, idx) => {
              const config = agentStatusConfig[step.status as AgentStatus]
              const Icon = config.icon
              const isLast = idx === agentPipeline.steps.length - 1

              return (
                <div key={step.name} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 px-5 py-3 min-w-[150px]",
                      config.bg
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        config.color,
                        step.status === "running" && "animate-spin"
                      )}
                    />
                    <span className="text-sm font-semibold">{step.name}</span>
                    <span className="text-xs text-muted-foreground text-center">{step.description}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{step.duration}</span>
                      <span className="text-foreground font-medium">{step.objectsProcessed} 객체</span>
                    </div>
                  </div>
                  {!isLast && <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Object list - left */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">변환 객체 목록</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {schemaConversions.map((obj, idx) => (
                  <button
                    key={obj.objectName}
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                      selectedIdx === idx
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs">{obj.objectName}</span>
                      <span
                        className={cn(
                          "text-xs font-bold shrink-0",
                          obj.score >= 95
                            ? "text-success"
                            : obj.score >= 85
                              ? "text-warning"
                              : "text-destructive"
                        )}
                      >
                        {obj.score}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{obj.objectType}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail - right */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-bold font-mono">{selected.objectName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selected.objectType}</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Score display */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex items-center justify-center h-16 w-16 rounded-full border-4",
                        selected.score >= 95
                          ? "border-success"
                          : selected.score >= 85
                            ? "border-warning"
                            : "border-destructive"
                      )}
                    >
                      <span className="text-2xl font-bold">{selected.score}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Evaluator Score</span>
                  </div>
                  <Badge
                    variant={selected.score >= 80 ? "success" : "destructive"}
                    className="text-sm px-3 py-1"
                  >
                    {selected.score >= 80 ? "GO" : "NO-GO"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diff Viewer */}
          <DiffViewer
            original={selected.oracleDDL}
            modified={selected.postgresqlDDL}
            language={`Oracle PL/SQL → PostgreSQL PL/pgSQL`}
          />

          {/* Conversion rules */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                적용된 변환 규칙
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selected.rules.map((rule) => (
                  <Badge key={rule} variant="outline" className="font-mono text-xs">
                    {rule}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Remediation history */}
          {selected.remediationHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Remediation 이력
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selected.remediationHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                            idx === selected.remediationHistory.length - 1
                              ? "bg-success/20 text-success border-2 border-success"
                              : "bg-muted text-muted-foreground border-2 border-muted-foreground/30"
                          )}
                        >
                          #{entry.attempt}
                        </div>
                        {idx < selected.remediationHistory.length - 1 && (
                          <div className="w-0.5 h-6 bg-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{entry.changes}</p>
                          <span
                            className={cn(
                              "text-sm font-bold",
                              entry.score >= 90
                                ? "text-success"
                                : entry.score >= 75
                                  ? "text-warning"
                                  : "text-destructive"
                            )}
                          >
                            {entry.score}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
