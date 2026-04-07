import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { migrationTables } from "@/data/data-migration"
import { Play, CheckCircle2, Loader2, Clock, XCircle, Database } from "lucide-react"

const statusConfig = {
  completed: { label: "완료", variant: "success" as const, icon: CheckCircle2 },
  running: { label: "실행 중", variant: "default" as const, icon: Loader2 },
  waiting: { label: "대기", variant: "secondary" as const, icon: Clock },
  failed: { label: "실패", variant: "destructive" as const, icon: XCircle },
}

function StatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  )
}

function MiniProgressBar({ progress, status }: { progress: number; status: string }) {
  const bgColor =
    status === "completed"
      ? "bg-green-500"
      : status === "running"
        ? "bg-blue-500"
        : status === "failed"
          ? "bg-red-500"
          : "bg-muted-foreground/30"

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bgColor} ${status === "running" ? "animate-pulse" : ""}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8">{progress}%</span>
    </div>
  )
}

export default function DataExecutionPage() {
  const [isRunning, setIsRunning] = useState(true)

  const completed = migrationTables.filter((t) => t.status === "completed").length
  const running = migrationTables.filter((t) => t.status === "running").length
  const waiting = migrationTables.filter((t) => t.status === "waiting").length
  const failed = migrationTables.filter((t) => t.status === "failed").length
  const total = migrationTables.length

  const totalRows = migrationTables.reduce((sum, t) => sum + t.rowCount, 0)
  const completedRows = migrationTables
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.rowCount, 0)
  const overallProgress = Math.round((completedRows / totalRows) * 100)

  const summaryCards = [
    { label: "전체 테이블", value: total, color: "text-foreground", bg: "bg-card" },
    { label: "완료", value: completed, color: "text-green-600", bg: "bg-green-500/10" },
    { label: "실행 중", value: running, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "대기", value: waiting, color: "text-muted-foreground", bg: "bg-muted" },
    { label: "실패", value: failed, color: "text-red-600", bg: "bg-red-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">데이터 이관 실행</h2>
          <p className="text-muted-foreground mt-1">DMS를 통한 Oracle → PostgreSQL 데이터 이관</p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className="gap-2"
          variant={isRunning ? "outline" : "default"}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              실행 중...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              이관 실행
            </>
          )}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={card.bg}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">전체 진행률</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedRows.toLocaleString()} / {totalRows.toLocaleString()} rows ({overallProgress}%)
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Migration table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">테이블별 이관 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Schema</TableHead>
                <TableHead className="text-right">Row Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {migrationTables.map((table) => (
                <TableRow
                  key={table.tableName}
                  className={table.status === "failed" ? "bg-red-500/5" : table.status === "running" ? "bg-blue-500/5" : ""}
                >
                  <TableCell className="font-mono text-sm font-medium">{table.tableName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {table.schema}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{table.rowCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={table.status} />
                  </TableCell>
                  <TableCell>
                    <MiniProgressBar progress={table.progress} status={table.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {table.startTime
                      ? new Date(table.startTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{table.duration ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
