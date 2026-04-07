import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { extractedSqls } from "@/data/app-migration"

export default function SqlExtractionPage() {
  const [mode, setMode] = useState<"static" | "dynamic">("static")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extracted, setExtracted] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const stats = useMemo(() => {
    const byType = { SELECT: 0, INSERT: 0, UPDATE: 0, DELETE: 0 }
    const byComplexity = { Low: 0, Medium: 0, High: 0 }
    for (const sql of extractedSqls) {
      byType[sql.sqlType]++
      byComplexity[sql.complexity]++
    }
    return { total: extractedSqls.length, byType, byComplexity }
  }, [])

  const handleExecute = () => {
    setIsRunning(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          setExtracted(true)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
  }

  const handleDownloadCsv = () => {
    const headers = "SQL ID,Mapper ID,SQL Type,Original SQL,Dynamic Tags,Complexity\n"
    const rows = extractedSqls
      .map(
        (sql) =>
          `"${sql.id}","${sql.mapperId}","${sql.sqlType}","${sql.originalSql.replace(/"/g, '""')}","${sql.hasDynamicTags ? "Yes" : "No"}","${sql.complexity}"`
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "extracted-sqls.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const complexityVariant = (c: string) => {
    if (c === "Low") return "success" as const
    if (c === "Medium") return "warning" as const
    return "destructive" as const
  }

  const sqlTypeVariant = (t: string) => {
    if (t === "SELECT") return "default" as const
    if (t === "INSERT") return "success" as const
    if (t === "UPDATE") return "warning" as const
    return "destructive" as const
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">SQL 추출</h2>
          <p className="text-sm text-muted-foreground mt-1">
            MyBatis Mapper 파일에서 SQL 구문을 추출합니다
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleDownloadCsv} disabled={!extracted}>
            CSV 다운로드
          </Button>
        </div>
      </div>

      {/* Mode Toggle & Execute */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setMode("static")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "static"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                정적 추출
              </button>
              <button
                onClick={() => setMode("dynamic")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "dynamic"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                동적 추출 (Mock)
              </button>
            </div>
            <Button onClick={handleExecute} disabled={isRunning}>
              {isRunning ? "추출 중..." : "추출 실행"}
            </Button>
            {isRunning && (
              <div className="flex-1 max-w-md">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {Math.min(Math.round(progress), 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {extracted && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">전체 추출</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">SQL 유형별</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="default">SELECT {stats.byType.SELECT}</Badge>
                <Badge variant="success">INSERT {stats.byType.INSERT}</Badge>
                <Badge variant="warning">UPDATE {stats.byType.UPDATE}</Badge>
                <Badge variant="destructive">DELETE {stats.byType.DELETE}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">복잡도별</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="success">Low {stats.byComplexity.Low}</Badge>
                <Badge variant="warning">Medium {stats.byComplexity.Medium}</Badge>
                <Badge variant="destructive">High {stats.byComplexity.High}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">추출 모드</p>
              <p className="text-lg font-semibold mt-1">
                {mode === "static" ? "정적 추출" : "동적 추출 (Mock)"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "static"
                  ? "XML 파싱 기반 SQL 추출"
                  : "런타임 SQL 캡처 시뮬레이션"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {extracted && (
        <Card>
          <div className="px-6 py-3 border-b border-border">
            <h3 className="text-base font-semibold">추출 결과 ({extractedSqls.length}건)</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">SQL ID</TableHead>
                <TableHead className="w-36">Mapper ID</TableHead>
                <TableHead className="w-24 text-center">SQL Type</TableHead>
                <TableHead>Original SQL</TableHead>
                <TableHead className="w-28 text-center">Dynamic Tags</TableHead>
                <TableHead className="w-24 text-center">Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractedSqls.map((sql) => (
                <TableRow
                  key={sql.id}
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedRow(expandedRow === sql.id ? null : sql.id)
                  }
                >
                  <TableCell className="font-mono text-xs">{sql.id}</TableCell>
                  <TableCell className="font-medium text-sm">{sql.mapperId}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sqlTypeVariant(sql.sqlType)}>{sql.sqlType}</Badge>
                  </TableCell>
                  <TableCell>
                    {expandedRow === sql.id ? (
                      <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/50 rounded-md p-3 border border-border">
                        {sql.originalSql}
                      </pre>
                    ) : (
                      <span className="text-sm text-muted-foreground truncate block max-w-md">
                        {sql.originalSql.length > 80
                          ? sql.originalSql.slice(0, 80) + "..."
                          : sql.originalSql}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={sql.hasDynamicTags ? "warning" : "secondary"}>
                      {sql.hasDynamicTags ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={complexityVariant(sql.complexity)}>
                      {sql.complexity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
