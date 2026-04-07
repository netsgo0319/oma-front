import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { testSettings } from "@/data/settings"
import { Save, CheckCircle2, Plus, Trash2, FlaskConical } from "lucide-react"

interface BindVariable {
  name: string
  type: string
  sampleValue: string
}

export default function TestSettingsPage() {
  const [bindVars, setBindVars] = useState<BindVariable[]>(testSettings.bindVariables)
  const [dataSourceType, setDataSourceType] = useState<"oracle-sample" | "synthetic" | "user-provided">("oracle-sample")
  const [dataSourceUrl, setDataSourceUrl] = useState(testSettings.dataSource)
  const [aopLogPath, setAopLogPath] = useState(testSettings.aopLogPath)
  const [storageType, setStorageType] = useState("file")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateBindVar(index: number, field: keyof BindVariable, value: string) {
    setBindVars((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)))
  }

  function removeBindVar(index: number) {
    setBindVars((prev) => prev.filter((_, i) => i !== index))
  }

  function addBindVar() {
    setBindVars((prev) => [...prev, { name: "", type: "VARCHAR", sampleValue: "" }])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">테스트 설정</h2>
          <p className="text-muted-foreground mt-1">SQL 테스트 실행을 위한 바인드 변수, 데이터 소스, AOP 설정</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              저장 완료
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              저장
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="bind-vars">
        <TabsList>
          <TabsTrigger value="bind-vars">바인드 변수</TabsTrigger>
          <TabsTrigger value="data-source">데이터 소스</TabsTrigger>
          <TabsTrigger value="aop">AOP 설정</TabsTrigger>
        </TabsList>

        {/* Bind Variables */}
        <TabsContent value="bind-vars">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  바인드 변수 설정
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addBindVar} className="gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  변수 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sample Value</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bindVars.map((bv, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={bv.name}
                          onChange={(e) => updateBindVar(i, "name", e.target.value)}
                          className="h-8 text-sm font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          value={bv.type}
                          onChange={(e) => updateBindVar(i, "type", e.target.value)}
                          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="INTEGER">INTEGER</option>
                          <option value="VARCHAR">VARCHAR</option>
                          <option value="DATE">DATE</option>
                          <option value="NUMERIC">NUMERIC</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={bv.sampleValue}
                          onChange={(e) => updateBindVar(i, "sampleValue", e.target.value)}
                          className="h-8 text-sm font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBindVar(i)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-3">
                총 {bindVars.length}개 바인드 변수가 등록되어 있습니다.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Source */}
        <TabsContent value="data-source">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">테스트 데이터 소스</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(
                  [
                    { value: "oracle-sample" as const, label: "Oracle 샘플 데이터", desc: "Oracle 소스 DB에서 샘플 데이터를 추출하여 테스트에 사용합니다." },
                    { value: "synthetic" as const, label: "합성 데이터 (Synthetic)", desc: "AI가 생성한 합성 데이터를 테스트에 사용합니다." },
                    { value: "user-provided" as const, label: "사용자 제공 데이터", desc: "사용자가 직접 제공한 테스트 데이터를 사용합니다." },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      dataSourceType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dataSource"
                      value={opt.value}
                      checked={dataSourceType === opt.value}
                      onChange={() => setDataSourceType(opt.value)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </div>
                    {dataSourceType === opt.value && (
                      <Badge variant="default" className="ml-auto shrink-0">선택됨</Badge>
                    )}
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium mb-1.5 block">JDBC URL</label>
                <Input
                  value={dataSourceUrl}
                  onChange={(e) => setDataSourceUrl(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AOP Settings */}
        <TabsContent value="aop">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AOP 테스트 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Error Log Collection Path</label>
                <Input
                  value={aopLogPath}
                  onChange={(e) => setAopLogPath(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  AOP 기반 SQL 실행 에러 로그가 저장되는 경로입니다.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Storage Type</label>
                <div className="flex gap-3">
                  {[
                    { value: "file", label: "File System" },
                    { value: "s3", label: "Amazon S3" },
                    { value: "cloudwatch", label: "CloudWatch Logs" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        storageType === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="storageType"
                        value={opt.value}
                        checked={storageType === opt.value}
                        onChange={() => setStorageType(opt.value)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {storageType === "s3" && (
                <div className="pl-4 border-l-2 border-primary/30 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">S3 Bucket</label>
                    <Input placeholder="s3://your-bucket/aop-logs/" className="font-mono text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">S3 Region</label>
                    <Input placeholder="ap-northeast-2" className="font-mono text-sm" />
                  </div>
                </div>
              )}

              {storageType === "cloudwatch" && (
                <div className="pl-4 border-l-2 border-primary/30 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Log Group</label>
                    <Input placeholder="/oma/aop-test-logs" className="font-mono text-sm" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
