import { useNavigate } from "react-router-dom"
import { Database, Code, TestTube2, HardDrive, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MetricCard } from "@/components/MetricCard"
import { StatusBadge } from "@/components/StatusBadge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  migrationProgress,
  recentTasks,
  metrics,
  workflowSteps,
} from "@/data/dashboard"

const phaseRoutes: Record<string, string> = {
  "step-1": "/db-migration/dms-results",
  "step-2": "/db-migration/ai-schema",
  "step-3": "/db-migration/schema-validation",
  "step-4": "/app-migration/sql-extraction",
  "step-5": "/app-migration/sql-filtering",
  "step-6": "/app-migration/query-rewrite",
  "step-7": "/app-migration/xml-merge",
  "step-8": "/app-migration/test-support",
  "step-9": "/data-migration/execution",
  "step-10": "/data-migration/validation",
}

const phaseColors: Record<string, string> = {
  "db-migration": "bg-blue-500",
  "app-migration": "bg-violet-500",
  "data-migration": "bg-emerald-500",
}

const phaseLabels: Record<string, string> = {
  "db-migration": "DB 마이그레이션",
  "app-migration": "앱 마이그레이션",
  "data-migration": "데이터 마이그레이션",
}

const statusColors: Record<string, string> = {
  completed: "border-success bg-success/10 text-success",
  running: "border-info bg-info/10 text-info",
  pending: "border-muted bg-muted/50 text-muted-foreground",
}

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
        <p className="text-muted-foreground mt-1">
          Oracle Migration Accelerator 전체 마이그레이션 현황
        </p>
      </div>

      {/* 진행 현황 보드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">진행 현황 보드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              label: "DB 마이그레이션",
              data: migrationProgress.dbMigration,
              color: "bg-blue-500",
            },
            {
              label: "앱 마이그레이션",
              data: migrationProgress.appMigration,
              color: "bg-violet-500",
            },
            {
              label: "데이터 마이그레이션",
              data: migrationProgress.dataMigration,
              color: "bg-emerald-500",
            },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">
                  {item.data.completed.toLocaleString()} / {item.data.total.toLocaleString()}
                  <span className="ml-2 font-semibold text-foreground">
                    {item.data.percentage}%
                  </span>
                </span>
              </div>
              <Progress value={item.data.percentage} colorClass={item.color} className="h-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 핵심 지표 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">핵심 지표</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="DB 객체 변환"
            value={`${metrics.dbObjectConversion.autoConverted + metrics.dbObjectConversion.agentConverted}`}
            subtitle={`자동 ${metrics.dbObjectConversion.autoConverted} + 에이전트 ${metrics.dbObjectConversion.agentConverted} / 실패 ${metrics.dbObjectConversion.failed}`}
            icon={Database}
            trend={{ direction: "up", percentage: 91.6 }}
          />
          <MetricCard
            title="SQL 변환"
            value={metrics.sqlConversion.completed.toLocaleString()}
            subtitle={`재작성 필요 ${metrics.sqlConversion.needsRewrite} / 대기 ${metrics.sqlConversion.pending}`}
            icon={Code}
            trend={{ direction: "up", percentage: 82.5 }}
          />
          <MetricCard
            title="테스트 결과"
            value={`${metrics.testResults.pass}`}
            subtitle={`실패 ${metrics.testResults.fail} / 스킵 ${metrics.testResults.skip}`}
            icon={TestTube2}
            trend={{ direction: "up", percentage: 96.2 }}
          />
          <MetricCard
            title="데이터 마이그레이션"
            value={`${metrics.dataMigration.completedTables}`}
            subtitle={`전체 ${metrics.dataMigration.totalRows} 행 이관`}
            icon={HardDrive}
            trend={{ direction: "up", percentage: 92.9 }}
          />
        </div>
      </div>

      {/* 실시간 작업 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">실시간 작업 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>작업명</TableHead>
                <TableHead>에이전트</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">소요 시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {task.agent ?? "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {task.duration}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 워크플로우 다이어그램 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">워크플로우 다이어그램</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Phase groups */}
          {(["db-migration", "app-migration", "data-migration"] as const).map(
            (phase) => {
              const steps = workflowSteps.filter((s) => s.phase === phase)
              return (
                <div key={phase} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${phaseColors[phase]}`} />
                    <span className="text-sm font-semibold">{phaseLabels[phase]}</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(phaseRoutes[step.id])}
                          className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 min-w-[140px] transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer ${statusColors[step.status]}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {step.status === "completed" && (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {step.status === "running" && (
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-info" />
                              </span>
                            )}
                            <span className="text-xs font-bold">{step.name}</span>
                          </div>
                          <span className="text-[10px] text-center leading-tight opacity-80">
                            {step.description}
                          </span>
                        </button>
                        {idx < steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          )}
        </CardContent>
      </Card>
    </div>
  )
}
