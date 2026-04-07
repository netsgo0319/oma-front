import { useState, useMemo } from "react"
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { schemaValidation } from "@/data/db-migration"

export default function SchemaValidationPage() {
  const [refOpen, setRefOpen] = useState(false)

  const summary = useMemo(() => {
    const totalMatched = schemaValidation.reduce((sum, r) => sum + r.matched, 0)
    const totalMismatched = schemaValidation.reduce((sum, r) => sum + r.mismatched, 0)
    const totalMissing = schemaValidation.reduce((sum, r) => sum + r.missing, 0)
    return { totalMatched, totalMismatched, totalMissing }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">스키마 검증</h2>
        <p className="text-muted-foreground mt-1">
          Oracle / PostgreSQL 소스-타겟 스키마 비교 검증 결과
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">일치</p>
                <p className="text-2xl font-bold text-success">
                  {summary.totalMatched.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">불일치</p>
                <p className="text-2xl font-bold text-warning">
                  {summary.totalMismatched.toLocaleString()}
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
                <p className="text-sm text-muted-foreground">누락</p>
                <p className="text-2xl font-bold text-destructive">
                  {summary.totalMissing.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">객체 유형별 검증 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>객체 유형</TableHead>
                <TableHead className="text-right">Oracle 수</TableHead>
                <TableHead className="text-right">PostgreSQL 수</TableHead>
                <TableHead className="text-right">일치</TableHead>
                <TableHead className="text-right">불일치</TableHead>
                <TableHead className="text-right">누락</TableHead>
                <TableHead className="w-[200px]">일치율</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemaValidation.map((row) => {
                const matchPct =
                  row.oracleCount > 0
                    ? (row.matched / row.oracleCount) * 100
                    : 100

                return (
                  <TableRow key={row.objectType}>
                    <TableCell className="font-medium">{row.objectType}</TableCell>
                    <TableCell className="text-right">{row.oracleCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.postgresCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-success font-medium">
                      {row.matched.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        row.mismatched > 0 ? "text-destructive bg-destructive/5" : ""
                      )}
                    >
                      {row.mismatched}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        row.missing > 0 ? "text-destructive bg-destructive/5" : ""
                      )}
                    >
                      {row.missing}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={matchPct}
                          colorClass={
                            matchPct === 100
                              ? "bg-success"
                              : matchPct >= 95
                                ? "bg-warning"
                                : "bg-destructive"
                          }
                          className="h-2 flex-1"
                        />
                        <span className="text-xs font-medium w-12 text-right">
                          {matchPct.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reference section */}
      <Card>
        <button
          onClick={() => setRefOpen(!refOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
        >
          <div>
            <h3 className="text-lg font-semibold">변환 패턴 참고 정보</h3>
            <p className="text-sm text-muted-foreground">Oracle to PostgreSQL 주요 변환 패턴</p>
          </div>
          {refOpen ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        {refOpen && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">데이터 타입 변환</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    ["NUMBER(p,s)", "NUMERIC(p,s)"],
                    ["VARCHAR2(n)", "VARCHAR(n)"],
                    ["DATE", "TIMESTAMP"],
                    ["CLOB", "TEXT"],
                    ["BLOB", "BYTEA"],
                    ["RAW(n)", "BYTEA"],
                  ].map(([from, to]) => (
                    <div key={from} className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-destructive/80">{from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-success/80">{to}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">함수 변환</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    ["NVL(a, b)", "COALESCE(a, b)"],
                    ["SYSDATE", "CURRENT_TIMESTAMP"],
                    ["DECODE(...)", "CASE ... END"],
                    ["ROWNUM", "ROW_NUMBER()"],
                    ["DBMS_OUTPUT", "(removed)"],
                    ["SEQ.NEXTVAL", "nextval('seq')"],
                  ].map(([from, to]) => (
                    <div key={from} className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-destructive/80">{from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-success/80">{to}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">구조 변환</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    ["Package", "Schema + Functions"],
                    ["Procedure (OUT)", "Function RETURNS"],
                    ["Trigger body", "Trigger Function + Trigger"],
                    ["Database Link", "postgres_fdw (FDW)"],
                    ["Materialized View REFRESH", "Manual REFRESH"],
                  ].map(([from, to]) => (
                    <div key={from} className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-destructive/80">{from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-success/80">{to}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">명명 규칙</h4>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>- Oracle: UPPER_CASE 식별자</p>
                  <p>- PostgreSQL: lower_case 식별자</p>
                  <p>- 스키마명 소문자 변환</p>
                  <p>- 인덱스/제약조건명 소문자 변환</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
