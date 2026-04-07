import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeEditor } from "@/components/CodeEditor"
import { queryRewriteResults } from "@/data/app-migration"

export default function ManualReviewPage() {
  const failedItems = useMemo(
    () => queryRewriteResults.filter((r) => r.status === "fail" || r.status === "retry"),
    []
  )

  const [selectedId, setSelectedId] = useState<string>(failedItems[0]?.sqlId ?? "")
  const [editedSqls, setEditedSqls] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const item of failedItems) {
      initial[item.sqlId] = item.convertedSql || ""
    }
    return initial
  })
  const [syntaxResults, setSyntaxResults] = useState<Record<string, { valid: boolean; message: string }>>({})
  const [compareResults, setCompareResults] = useState<Record<string, { matching: boolean; oracleRows: number; pgRows: number }>>({})

  const selectedItem = failedItems.find((r) => r.sqlId === selectedId)

  const handleSyntaxCheck = () => {
    if (!selectedId) return
    const sql = editedSqls[selectedId] || ""
    const hasIssue = sql.includes("ADD_MONTHS") || sql.includes("SYSDATE") || sql.includes("NVL(")
    setSyntaxResults((prev) => ({
      ...prev,
      [selectedId]: hasIssue
        ? { valid: false, message: "Oracle 전용 함수가 감지되었습니다: " + (sql.includes("ADD_MONTHS") ? "ADD_MONTHS" : sql.includes("SYSDATE") ? "SYSDATE" : "NVL") }
        : { valid: true, message: "PostgreSQL 구문 검증 통과" },
    }))
  }

  const handleExecuteCompare = () => {
    if (!selectedId) return
    setCompareResults((prev) => ({
      ...prev,
      [selectedId]: {
        matching: Math.random() > 0.4,
        oracleRows: Math.floor(Math.random() * 100) + 1,
        pgRows: Math.floor(Math.random() * 100) + 1,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">수동 리뷰</h2>
        <p className="text-sm text-muted-foreground mt-1">
          자동 변환 실패/재시도 초과 SQL을 수동으로 수정합니다
        </p>
      </div>

      <div className="flex gap-4" style={{ minHeight: "700px" }}>
        {/* Left Panel - Failed SQL List */}
        <Card className="w-72 shrink-0 overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border">
            <CardTitle className="text-sm font-medium">
              미완료 SQL ({failedItems.length}건)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto" style={{ maxHeight: "650px" }}>
            {failedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                미완료 SQL이 없습니다
              </p>
            ) : (
              <div className="space-y-1">
                {failedItems.map((item) => (
                  <button
                    key={item.sqlId}
                    onClick={() => setSelectedId(item.sqlId)}
                    className={`w-full text-left rounded-md p-3 transition-colors ${
                      selectedId === item.sqlId
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-medium">{item.sqlId}</span>
                      <Badge variant={item.status === "fail" ? "destructive" : "warning"}>
                        {item.status === "fail" ? "Fail" : "Retry"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Retries: {item.retryCount}
                    </p>
                    {item.agentLog && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item.agentLog}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - SQL Editor */}
        <div className="flex-1 space-y-4">
          {selectedItem ? (
            <>
              {/* Header Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{selectedItem.sqlId}</span>
                    <Badge variant={selectedItem.status === "fail" ? "destructive" : "warning"}>
                      {selectedItem.status === "fail" ? "Fail" : "Retry"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Retry Count: {selectedItem.retryCount}
                    </span>
                    <div className="flex-1" />
                    <div className="flex gap-1">
                      {selectedItem.rules.map((rule) => (
                        <Badge key={rule} variant="outline" className="text-[10px]">
                          {rule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedItem.agentLog && (
                    <p className="text-sm text-muted-foreground mt-2 bg-muted/30 rounded-md p-2">
                      {selectedItem.agentLog}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Oracle Original (Read-only) */}
              <div>
                <p className="text-sm font-medium mb-2">Oracle Original (Read-only)</p>
                <CodeEditor
                  value={selectedItem.originalSql}
                  language="Oracle SQL"
                  readOnly
                  rows={6}
                />
              </div>

              {/* PostgreSQL Version (Editable) */}
              <div>
                <p className="text-sm font-medium mb-2">PostgreSQL Version (Editable)</p>
                <CodeEditor
                  value={editedSqls[selectedId] || ""}
                  onChange={(val) =>
                    setEditedSqls((prev) => ({ ...prev, [selectedId]: val }))
                  }
                  language="PostgreSQL"
                  rows={6}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button onClick={handleSyntaxCheck}>구문 검증</Button>
                <Button variant="outline" onClick={handleExecuteCompare}>
                  실행 비교
                </Button>
              </div>

              {/* Simulated Results */}
              <div className="space-y-3">
                {syntaxResults[selectedId] && (
                  <Card
                    className={
                      syntaxResults[selectedId].valid
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-destructive/30 bg-destructive/5"
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={syntaxResults[selectedId].valid ? "success" : "destructive"}
                        >
                          {syntaxResults[selectedId].valid ? "Valid" : "Invalid"}
                        </Badge>
                        <span className="text-sm">{syntaxResults[selectedId].message}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {compareResults[selectedId] && (
                  <Card
                    className={
                      compareResults[selectedId].matching
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-orange-500/30 bg-orange-500/5"
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-6">
                        <Badge
                          variant={compareResults[selectedId].matching ? "success" : "warning"}
                        >
                          {compareResults[selectedId].matching ? "결과 일치" : "결과 불일치"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Oracle Rows: <strong>{compareResults[selectedId].oracleRows}</strong>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          PostgreSQL Rows: <strong>{compareResults[selectedId].pgRows}</strong>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Card className="flex-1">
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <p className="text-muted-foreground">
                  좌측 목록에서 SQL을 선택하세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
