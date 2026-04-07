import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { CodeEditor } from "@/components/CodeEditor"
import { sampleQueries } from "@/data/tools"
import { Play, FileSearch, Columns2 } from "lucide-react"

const mockOracleResults = [
  { employee_id: 100, full_name: "Steven King", salary: 24000, department_id: 90 },
  { employee_id: 101, full_name: "Neena Kochhar", salary: 17000, department_id: 90 },
  { employee_id: 102, full_name: "Lex De Haan", salary: 17000, department_id: 90 },
  { employee_id: 103, full_name: "Alexander Hunold", salary: 9000, department_id: 60 },
  { employee_id: 104, full_name: "Bruce Ernst", salary: 6000, department_id: 60 },
]

const mockPgResults = [
  { employee_id: 100, full_name: "Steven King", salary: 24000, department_id: 90 },
  { employee_id: 101, full_name: "Neena Kochhar", salary: 17000, department_id: 90 },
  { employee_id: 102, full_name: "Lex De Haan", salary: 17000, department_id: 90 },
  { employee_id: 103, full_name: "Alexander Hunold", salary: 9000, department_id: 60 },
  { employee_id: 104, full_name: "Bruce Ernst", salary: 6000, department_id: 60 },
]

const mockExplainPlan = `QUERY PLAN
──────────────────────────────────────────────────────────────
Sort  (cost=24.78..25.34 rows=224 width=43)
  Sort Key: last_name
  →  Seq Scan on employees  (cost=0.00..16.12 rows=224 width=43)
        Filter: (department_id = $1)
Planning Time: 0.124 ms
Execution Time: 0.089 ms`

type DbMode = "oracle" | "postgresql" | "compare"
type ViewMode = "results" | "explain"

export default function SqlExecutorPage() {
  const [dbMode, setDbMode] = useState<DbMode>("oracle")
  const [viewMode, setViewMode] = useState<ViewMode>("results")
  const [sql, setSql] = useState(sampleQueries[0].sql)
  const [hasExecuted, setHasExecuted] = useState(false)

  const sampleOptions = [
    { value: "", label: "-- 샘플 쿼리 선택 --" },
    ...sampleQueries.map((q, i) => ({ value: String(i), label: q.name })),
  ]

  function handleSampleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const idx = Number(e.target.value)
    if (!isNaN(idx) && sampleQueries[idx]) {
      setSql(sampleQueries[idx].sql)
      setHasExecuted(false)
    }
  }

  function handleExecute() {
    setViewMode("results")
    setHasExecuted(true)
  }

  function handleExplain() {
    setViewMode("explain")
    setHasExecuted(true)
  }

  function ResultTable({ data, title }: { data: typeof mockOracleResults; title?: string }) {
    if (data.length === 0) return null
    const columns = Object.keys(data[0])
    return (
      <div>
        {title && <h4 className="text-sm font-semibold mb-2">{title}</h4>}
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="text-xs uppercase">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col} className="font-mono text-sm">
                    {String(row[col as keyof typeof row])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-2">{data.length} rows returned</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">SQL 실행기</h2>
        <p className="text-muted-foreground mt-1">Oracle / PostgreSQL SQL 실행 및 비교</p>
      </div>

      {/* DB Mode + Sample Query */}
      <div className="flex items-center gap-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(
            [
              { value: "oracle" as const, label: "Oracle" },
              { value: "postgresql" as const, label: "PostgreSQL" },
              { value: "compare" as const, label: "비교 모드" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDbMode(opt.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                dbMode === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <Select options={sampleOptions} onChange={handleSampleSelect} />
        </div>
      </div>

      {/* SQL Editor */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <CodeEditor value={sql} onChange={setSql} language="SQL" rows={8} />
          <div className="flex gap-2">
            <Button onClick={handleExecute} className="gap-2">
              <Play className="h-4 w-4" />
              실행
            </Button>
            <Button variant="outline" onClick={handleExplain} className="gap-2">
              <FileSearch className="h-4 w-4" />
              EXPLAIN
            </Button>
            {dbMode === "compare" && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                <Columns2 className="h-4 w-4" />
                비교 모드: 양쪽 DB에서 동시 실행
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasExecuted && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {viewMode === "explain" ? "실행 계획 (Execution Plan)" : "실행 결과"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "explain" ? (
              <pre className="bg-muted rounded-lg p-4 text-sm font-mono overflow-auto whitespace-pre">
                {mockExplainPlan}
              </pre>
            ) : dbMode === "compare" ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3 px-4 bg-orange-500/10">
                    <CardTitle className="text-sm text-orange-600">Oracle</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResultTable data={mockOracleResults} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3 px-4 bg-blue-500/10">
                    <CardTitle className="text-sm text-blue-600">PostgreSQL</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResultTable data={mockPgResults} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <ResultTable
                data={dbMode === "oracle" ? mockOracleResults : mockPgResults}
                title={dbMode === "oracle" ? "Oracle Results" : "PostgreSQL Results"}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
