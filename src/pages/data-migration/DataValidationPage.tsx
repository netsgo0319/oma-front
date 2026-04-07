import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { validationResults } from "@/data/data-migration"
import { CheckCircle2, XCircle, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react"

export default function DataValidationPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const totalValidated = validationResults.length
  const passCount = validationResults.filter((r) => r.match).length
  const failCount = validationResults.filter((r) => !r.match).length
  const matchRate = ((passCount / totalValidated) * 100).toFixed(1)

  const summaryCards = [
    { label: "검증 완료", value: String(totalValidated), icon: ShieldCheck, color: "text-foreground", bg: "bg-card" },
    { label: "PASS", value: String(passCount), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
    { label: "FAIL", value: String(failCount), icon: XCircle, color: "text-red-600", bg: "bg-red-500/10" },
    { label: "일치율", value: `${matchRate}%`, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">데이터 검증</h2>
        <p className="text-muted-foreground mt-1">Oracle / PostgreSQL 간 데이터 정합성 검증 결과</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className={card.bg}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Validation table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">테이블별 검증 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Table Name</TableHead>
                <TableHead className="text-right">Oracle Row Count</TableHead>
                <TableHead className="text-right">PostgreSQL Row Count</TableHead>
                <TableHead className="text-center">Match</TableHead>
                <TableHead className="text-center">Sample Check</TableHead>
                <TableHead>Sequence Check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationResults.map((row) => (
                <tbody key={row.tableName}>
                  <TableRow
                    className={`cursor-pointer ${!row.match ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}
                    onClick={() => setExpandedRow(expandedRow === row.tableName ? null : row.tableName)}
                  >
                    <TableCell className="w-8">
                      {expandedRow === row.tableName ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">{row.tableName}</TableCell>
                    <TableCell className="text-right font-mono">{row.oracleRowCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{row.postgresRowCount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      {row.match ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 inline" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 inline" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.sampleCheck === "pass" ? "success" : "destructive"}>
                        {row.sampleCheck === "pass" ? "PASS" : "FAIL"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.sequenceCheck ?? (row.match ? "OK" : "-")}
                    </TableCell>
                  </TableRow>
                  {expandedRow === row.tableName && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="p-4 space-y-3">
                          <h4 className="font-semibold text-sm">상세 검증 정보 - {row.tableName}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Oracle Row Count: </span>
                              <span className="font-mono font-medium">{row.oracleRowCount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">PostgreSQL Row Count: </span>
                              <span className="font-mono font-medium">{row.postgresRowCount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">차이: </span>
                              <span className={`font-mono font-medium ${!row.match ? "text-red-600" : "text-green-600"}`}>
                                {row.match ? "0" : (row.oracleRowCount - row.postgresRowCount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          {!row.match && (
                            <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm">
                              <p className="font-medium text-red-600">불일치 원인</p>
                              <p className="text-muted-foreground mt-1">
                                {row.sequenceCheck ?? "데이터 이관이 아직 완료되지 않았거나 DMS 태스크 오류가 발생했습니다."}
                              </p>
                            </div>
                          )}
                          {row.match && (
                            <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm">
                              <p className="font-medium text-green-600">검증 통과</p>
                              <p className="text-muted-foreground mt-1">
                                행 수 일치, 샘플 데이터 검증 통과, 시퀀스 무결성 확인 완료
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
