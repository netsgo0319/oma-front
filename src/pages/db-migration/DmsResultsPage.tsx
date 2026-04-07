import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, Package, Zap } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { assessmentResults } from "@/data/db-migration"

const complexityVariant: Record<string, "default" | "secondary" | "warning" | "destructive"> = {
  Simple: "secondary",
  Medium: "warning",
  Complex: "destructive",
}

const statusVariant: Record<string, "success" | "destructive"> = {
  Converted: "success",
  Failed: "destructive",
}

export default function DmsResultsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const summary = useMemo(() => {
    const total = assessmentResults.length
    const converted = assessmentResults.filter((r) => r.status === "Converted").length
    const failed = assessmentResults.filter((r) => r.status === "Failed").length
    return { total, converted, failed }
  }, [])

  const filtered = useMemo(() => {
    let items = assessmentResults
    if (activeTab === "converted") items = items.filter((r) => r.status === "Converted")
    else if (activeTab === "failed") items = items.filter((r) => r.status === "Failed")

    if (sortField) {
      items = [...items].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortField] as string
        const bv = (b as Record<string, unknown>)[sortField] as string
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return items
  }, [activeTab, sortField, sortAsc])

  const chartData = useMemo(() => {
    const types = [...new Set(assessmentResults.map((r) => r.objectType))]
    return types.map((type) => {
      const items = assessmentResults.filter((r) => r.objectType === type)
      return {
        type,
        "변환 완료": items.filter((r) => r.status === "Converted").length,
        "실패": items.filter((r) => r.status === "Failed").length,
      }
    })
  }, [])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assessment 결과</h2>
          <p className="text-muted-foreground mt-1">
            DMS 스키마 변환 평가 결과 — 실패 항목은 AI 에이전트로 변환 시도
          </p>
        </div>
        {summary.failed > 0 && (
          <Button onClick={() => navigate("../db-migration/ai-schema")} className="gap-2">
            <Zap className="h-4 w-4" />
            실패 {summary.failed}건 AI 에이전트로 변환
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">전체 객체</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">자동 변환 완료</p>
                <p className="text-2xl font-bold">
                  {summary.converted}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({((summary.converted / summary.total) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-3">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">실패 (AI 에이전트 변환 대상)</p>
                <p className="text-2xl font-bold">
                  {summary.failed}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({((summary.failed / summary.total) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">객체 유형별 변환 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="type" className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
              <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="변환 완료" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="실패" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabbed table */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">전체 ({summary.total})</TabsTrigger>
              <TabsTrigger value="converted">변환 완료 ({summary.converted})</TabsTrigger>
              <TabsTrigger value="failed">실패 ({summary.failed})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("objectName")}
                    >
                      객체명 {sortField === "objectName" && (sortAsc ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("objectType")}
                    >
                      유형 {sortField === "objectType" && (sortAsc ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("schema")}
                    >
                      스키마 {sortField === "schema" && (sortAsc ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>복잡도</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>실패 사유</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.objectName}>
                      <TableCell className="font-mono text-sm font-medium">
                        {row.objectName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.objectType}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.schema}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={complexityVariant[row.complexity]}>{row.complexity}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[row.status] ?? "secondary"}>{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                        {row.failureReason ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
