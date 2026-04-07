import { useState, useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DiffViewer } from "@/components/DiffViewer"
import { LogViewer } from "@/components/LogViewer"
import { queryRewriteResults } from "@/data/app-migration"

export default function QueryRewritePage() {
  const [mode, setMode] = useState<"sample" | "full">("sample")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const stats = useMemo(() => {
    const s = { total: queryRewriteResults.length, pass: 0, fail: 0, retry: 0, pending: 0 }
    for (const r of queryRewriteResults) {
      s[r.status]++
    }
    return s
  }, [])

  const handleExecute = () => {
    setIsRunning(true)
    setProgress(0)
    let current = 0
    const total = queryRewriteResults.length
    const interval = setInterval(() => {
      current++
      setProgress(current)
      if (current >= total) {
        clearInterval(interval)
        setIsRunning(false)
        setCompleted(true)
      }
    }, 150)
  }

  const statusVariant = (status: string) => {
    if (status === "pass") return "success" as const
    if (status === "fail") return "destructive" as const
    return "warning" as const
  }

  const statusLabel = (status: string) => {
    if (status === "pass") return "Pass"
    if (status === "fail") return "Fail"
    return "Retry"
  }

  const generateAgentLogs = (result: (typeof queryRewriteResults)[number]) => {
    const logs = [
      { timestamp: "2026-04-06T10:00:01Z", level: "info" as const, message: `Starting conversion: ${result.sqlId}` },
      { timestamp: "2026-04-06T10:00:02Z", level: "debug" as const, message: "Analyzing Oracle-specific patterns..." },
      { timestamp: "2026-04-06T10:00:03Z", level: "info" as const, message: `Rules applied: ${result.rules.join(", ")}` },
    ]
    if (result.retryCount > 0) {
      logs.push({
        timestamp: "2026-04-06T10:00:04Z",
        level: "warn" as const,
        message: `Retry attempt (${result.retryCount} retries). ${result.agentLog || ""}`,
      })
    }
    if (result.status === "pass") {
      logs.push({
        timestamp: "2026-04-06T10:00:05Z",
        level: "info" as const,
        message: `Test passed. Row count: ${result.testResult?.rowCount}, Matches original: ${result.testResult?.matchesOriginal}`,
      })
    } else if (result.status === "fail") {
      logs.push({
        timestamp: "2026-04-06T10:00:05Z",
        level: "error" as const,
        message: `Conversion failed after ${result.retryCount} retries. ${result.agentLog || ""}`,
      })
    } else {
      logs.push({
        timestamp: "2026-04-06T10:00:05Z",
        level: "warn" as const,
        message: `In retry state. ${result.agentLog || ""}`,
      })
    }
    return logs
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Query Rewrite (AI Agent)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI 에이전트를 통한 Oracle SQL을 PostgreSQL로 자동 변환
        </p>
      </div>

      {/* Mode & Execute */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setMode("sample")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "sample"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                샘플 변환
              </button>
              <button
                onClick={() => setMode("full")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "full"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                전체 변환
              </button>
            </div>
            <Button onClick={handleExecute} disabled={isRunning}>
              {isRunning ? "변환 중..." : "변환 실행"}
            </Button>
            {isRunning && (
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 max-w-md h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${(progress / queryRewriteResults.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {progress}/{queryRewriteResults.length} completed
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {completed && (
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, cls: "text-foreground" },
            { label: "Pass", value: stats.pass, cls: "text-emerald-600" },
            { label: "Fail", value: stats.fail, cls: "text-destructive" },
            { label: "Retry", value: stats.retry, cls: "text-orange-500" },
            { label: "Pending", value: stats.pending, cls: "text-muted-foreground" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results List */}
      {completed && (
        <div className="space-y-3">
          {queryRewriteResults.map((result) => (
            <Card key={result.sqlId} className="overflow-hidden">
              <button
                onClick={() =>
                  setExpandedRow(expandedRow === result.sqlId ? null : result.sqlId)
                }
                className="w-full text-left"
              >
                <CardHeader className="py-3 px-6">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-medium w-20">{result.sqlId}</span>
                    <Badge variant={statusVariant(result.status)}>
                      {statusLabel(result.status)}
                    </Badge>
                    {result.retryCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Retry: {result.retryCount}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Rules: {result.rules.length}
                    </span>
                    <div className="flex-1" />
                    <div className="flex gap-1">
                      {result.rules.slice(0, 3).map((rule) => (
                        <Badge key={rule} variant="outline" className="text-[10px]">
                          {rule}
                        </Badge>
                      ))}
                      {result.rules.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{result.rules.length - 3}
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {expandedRow === result.sqlId ? "\u25B2" : "\u25BC"}
                    </span>
                  </div>
                </CardHeader>
              </button>

              {expandedRow === result.sqlId && (
                <CardContent className="px-6 pb-6 pt-0 space-y-4 border-t border-border">
                  {/* Diff Viewer */}
                  <div>
                    <p className="text-sm font-medium mb-2">Oracle Original vs PostgreSQL Converted</p>
                    <DiffViewer
                      original={result.originalSql}
                      modified={result.convertedSql || "-- Conversion pending --"}
                      language="SQL"
                    />
                  </div>

                  {/* Applied Rules */}
                  <div>
                    <p className="text-sm font-medium mb-2">적용된 규칙</p>
                    <div className="flex flex-wrap gap-2">
                      {result.rules.map((rule) => (
                        <Badge key={rule} variant="secondary">
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Test Result */}
                  {result.testResult && (
                    <div>
                      <p className="text-sm font-medium mb-2">테스트 결과</p>
                      <Card className="bg-muted/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-6 text-sm">
                            <span>
                              실행:{" "}
                              <Badge variant={result.testResult.executed ? "success" : "destructive"}>
                                {result.testResult.executed ? "성공" : "실패"}
                              </Badge>
                            </span>
                            <span>Row Count: <strong>{result.testResult.rowCount}</strong></span>
                            <span>
                              원본 일치:{" "}
                              <Badge
                                variant={result.testResult.matchesOriginal ? "success" : "destructive"}
                              >
                                {result.testResult.matchesOriginal ? "일치" : "불일치"}
                              </Badge>
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Agent Trajectory Log */}
                  <details>
                    <summary className="text-sm font-medium mb-2 cursor-pointer">
                      Agent Trajectory Log
                    </summary>
                    <LogViewer logs={generateAgentLogs(result)} maxHeight="200px" />
                  </details>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
