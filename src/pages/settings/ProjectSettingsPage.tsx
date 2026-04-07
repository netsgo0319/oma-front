import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { projectSettings } from "@/data/settings"
import { Save, Plug, CheckCircle2, Loader2, Database, Server, Table2, CheckSquare, Square } from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { tableCatalog, getSchemas, getTablesBySchema, getSchemaStats } from "@/data/table-catalog"
import type { MigrationScope } from "@/types/project"
import { cn } from "@/lib/utils"

function FormField({ label, value, onChange, type = "text" }: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

export default function ProjectSettingsPage() {
  const [settings, setSettings] = useState(projectSettings)
  const [oracleTestStatus, setOracleTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [pgTestStatus, setPgTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [saved, setSaved] = useState(false)

  function testOracleConnection() {
    setOracleTestStatus("testing")
    setTimeout(() => setOracleTestStatus("success"), 1500)
  }

  function testPgConnection() {
    setPgTestStatus("testing")
    setTimeout(() => setPgTestStatus("success"), 1500)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function ConnectionStatus({ status }: { status: typeof oracleTestStatus }) {
    if (status === "idle") return null
    if (status === "testing")
      return <span className="text-sm text-muted-foreground flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" />테스트 중...</span>
    if (status === "success")
      return <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />연결 성공</span>
    return <span className="text-sm text-red-600">연결 실패</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">프로젝트 설정</h2>
          <p className="text-muted-foreground mt-1">OMA 프로젝트 기본 설정 및 데이터베이스 접속 정보</p>
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

      {/* Project info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            프로젝트 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField
              label="프로젝트 이름"
              value={settings.projectName}
              onChange={(v) => setSettings({ ...settings, projectName: v })}
            />
          </div>
          <FormField
            label="OMA Base Path"
            value={settings.omaBasePath}
            onChange={(v) => setSettings({ ...settings, omaBasePath: v })}
          />
          <FormField
            label="Application Source Path"
            value={settings.appSourcePath}
            onChange={(v) => setSettings({ ...settings, appSourcePath: v })}
          />
        </CardContent>
      </Card>

      {/* Source DB */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-orange-600" />
              소스 DB (Oracle) 접속 정보
            </CardTitle>
            <div className="flex items-center gap-3">
              <ConnectionStatus status={oracleTestStatus} />
              <Button variant="outline" size="sm" onClick={testOracleConnection} className="gap-1">
                <Plug className="h-3.5 w-3.5" />
                접속 테스트
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField
            label="Host"
            value={settings.sourceDb.host}
            onChange={(v) => setSettings({ ...settings, sourceDb: { ...settings.sourceDb, host: v } })}
          />
          <FormField
            label="Port"
            value={String(settings.sourceDb.port)}
            onChange={(v) => setSettings({ ...settings, sourceDb: { ...settings.sourceDb, port: Number(v) } })}
          />
          <FormField
            label="SID"
            value={settings.sourceDb.sid}
            onChange={(v) => setSettings({ ...settings, sourceDb: { ...settings.sourceDb, sid: v } })}
          />
          <FormField
            label="User"
            value={settings.sourceDb.user}
            onChange={(v) => setSettings({ ...settings, sourceDb: { ...settings.sourceDb, user: v } })}
          />
          <FormField
            label="Password"
            value={settings.sourceDb.password}
            type="password"
            onChange={(v) => setSettings({ ...settings, sourceDb: { ...settings.sourceDb, password: v } })}
          />
        </CardContent>
      </Card>

      {/* Target DB */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              타겟 DB (PostgreSQL) 접속 정보
            </CardTitle>
            <div className="flex items-center gap-3">
              <ConnectionStatus status={pgTestStatus} />
              <Button variant="outline" size="sm" onClick={testPgConnection} className="gap-1">
                <Plug className="h-3.5 w-3.5" />
                접속 테스트
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <FormField
            label="Host"
            value={settings.targetDb.host}
            onChange={(v) => setSettings({ ...settings, targetDb: { ...settings.targetDb, host: v } })}
          />
          <FormField
            label="Port"
            value={String(settings.targetDb.port)}
            onChange={(v) => setSettings({ ...settings, targetDb: { ...settings.targetDb, port: Number(v) } })}
          />
          <FormField
            label="Database"
            value={settings.targetDb.database}
            onChange={(v) => setSettings({ ...settings, targetDb: { ...settings.targetDb, database: v } })}
          />
          <FormField
            label="User"
            value={settings.targetDb.user}
            onChange={(v) => setSettings({ ...settings, targetDb: { ...settings.targetDb, user: v } })}
          />
          <FormField
            label="Password"
            value={settings.targetDb.password}
            type="password"
            onChange={(v) => setSettings({ ...settings, targetDb: { ...settings.targetDb, password: v } })}
          />
        </CardContent>
      </Card>

      {/* DMS Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-purple-600" />
            DMS 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <FormField
            label="Replication Instance ARN"
            value={settings.dmsConfig.projectArn}
            onChange={(v) => setSettings({ ...settings, dmsConfig: { ...settings.dmsConfig, projectArn: v } })}
          />
          <FormField
            label="S3 Bucket"
            value={settings.dmsConfig.s3Bucket}
            onChange={(v) => setSettings({ ...settings, dmsConfig: { ...settings.dmsConfig, s3Bucket: v } })}
          />
        </CardContent>
      </Card>

      {/* Migration Scope */}
      <MigrationScopeCard />
    </div>
  )
}

function MigrationScopeCard() {
  const { activeProject, updateMigrationScope } = useProject()
  const [editing, setEditing] = useState(false)

  const scope = activeProject?.migrationScope
  if (!scope) return null

  const schemas = getSchemas()
  const [localMode, setLocalMode] = useState(scope.mode)
  const [localSchemas, setLocalSchemas] = useState(new Set(scope.selectedSchemas))
  const [localTables, setLocalTables] = useState(new Set(scope.selectedTables))

  const startEdit = () => {
    setLocalMode(scope.mode)
    setLocalSchemas(new Set(scope.selectedSchemas))
    setLocalTables(new Set(scope.selectedTables))
    setEditing(true)
  }

  const saveScope = () => {
    const tableCount = localMode === 'all'
      ? tableCatalog.length
      : localMode === 'schema'
        ? [...localSchemas].reduce((sum, s) => sum + getTablesBySchema(s).length, 0)
        : localTables.size

    const newScope: MigrationScope = {
      mode: localMode,
      selectedSchemas: [...localSchemas],
      selectedTables: [...localTables],
      description: localMode === 'all'
        ? `전체 ${tableCatalog.length}개 테이블`
        : localMode === 'schema'
          ? `${localSchemas.size}개 스키마 (${tableCount}개 테이블)`
          : `${localTables.size}개 테이블 직접 선택`,
    }
    updateMigrationScope(newScope)
    setEditing(false)
  }

  const toggleSchema = (schema: string) => {
    setLocalSchemas((prev) => {
      const next = new Set(prev)
      if (next.has(schema)) next.delete(schema)
      else next.add(schema)
      return next
    })
  }

  const toggleTable = (fullName: string) => {
    setLocalTables((prev) => {
      const next = new Set(prev)
      if (next.has(fullName)) next.delete(fullName)
      else next.add(fullName)
      return next
    })
  }

  // Resolved table list for display
  const scopeTables = scope.mode === 'all'
    ? tableCatalog
    : scope.mode === 'schema'
      ? tableCatalog.filter((t) => scope.selectedSchemas.includes(t.schema))
      : tableCatalog.filter((t) => scope.selectedTables.includes(t.fullName))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Table2 className="h-4 w-4 text-emerald-600" />
            마이그레이션 범위
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {scope.description}
            </span>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={startEdit}>
                수정
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" onClick={saveScope}>저장</Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>취소</Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            {/* Mode selector */}
            <div className="flex gap-2">
              {([
                { value: 'all' as const, label: '전체 테이블', count: tableCatalog.length },
                { value: 'schema' as const, label: '스키마 단위', count: schemas.length },
                { value: 'table' as const, label: '테이블 직접 선택', count: null },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocalMode(opt.value)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                    localMode === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-foreground/20"
                  )}
                >
                  {opt.label} {opt.count !== null && `(${opt.count})`}
                </button>
              ))}
            </div>

            {/* All tables preview */}
            {localMode === 'all' && (
              <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">전체 {tableCatalog.length}개 테이블이 마이그레이션 대상에 포함됩니다.</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {schemas.map((schema) => {
                    const stats = getSchemaStats(schema)
                    return (
                      <span key={schema} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px]">
                        <span className="font-medium">{schema}</span>
                        <span className="text-muted-foreground/60">{stats.tableCount}개 · {stats.totalRows.toLocaleString()} rows</span>
                      </span>
                    )
                  })}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground/50">
                  총 {tableCatalog.reduce((s, t) => s + t.rowCount, 0).toLocaleString()} rows · {tableCatalog.reduce((s, t) => s + t.sizeMb, 0).toFixed(0)} MB
                </p>
              </div>
            )}

            {/* Schema selection */}
            {localMode === 'schema' && (
              <div className="grid grid-cols-3 gap-2">
                {schemas.map((schema) => {
                  const stats = getSchemaStats(schema)
                  const selected = localSchemas.has(schema)
                  return (
                    <button
                      key={schema}
                      onClick={() => toggleSchema(schema)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                        selected ? "border-primary bg-primary/10" : "border-border hover:border-foreground/20"
                      )}
                    >
                      {selected ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                      <div>
                        <span className="text-xs font-medium">{schema}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {stats.tableCount}개 · {stats.totalRows.toLocaleString()} rows
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Table selection */}
            {localMode === 'table' && (
              <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                {schemas.map((schema) => (
                  <div key={schema}>
                    <div className="sticky top-0 bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                      {schema}
                    </div>
                    {getTablesBySchema(schema).map((t) => {
                      const selected = localTables.has(t.fullName)
                      return (
                        <button
                          key={t.fullName}
                          onClick={() => toggleTable(t.fullName)}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-accent/50",
                            selected && "bg-primary/5"
                          )}
                        >
                          {selected ? <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0" /> : <Square className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                          <span className="text-xs flex-1">{t.tableName}</span>
                          <span className="text-[10px] text-muted-foreground">{t.rowCount.toLocaleString()} rows</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Read-only view: table list */
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-2">
              선택 방식: <span className="font-medium text-foreground">
                {scope.mode === 'all' ? '전체 테이블' : scope.mode === 'schema' ? '스키마 단위' : '테이블 직접 선택'}
              </span>
              {scope.mode === 'schema' && scope.selectedSchemas.length > 0 && (
                <span> — {scope.selectedSchemas.join(', ')}</span>
              )}
            </div>
            <div className="rounded-md border border-border overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-1.5 font-medium">테이블</th>
                    <th className="text-left px-3 py-1.5 font-medium">스키마</th>
                    <th className="text-right px-3 py-1.5 font-medium">Rows</th>
                    <th className="text-right px-3 py-1.5 font-medium">Size (MB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scopeTables.map((t) => (
                    <tr key={t.fullName} className="hover:bg-accent/30">
                      <td className="px-3 py-1.5">{t.tableName}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{t.schema}</td>
                      <td className="px-3 py-1.5 text-right">{t.rowCount.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-right">{t.sizeMb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[10px] text-muted-foreground">
              총 {scopeTables.length}개 테이블 · {scopeTables.reduce((s, t) => s + t.rowCount, 0).toLocaleString()} rows · {scopeTables.reduce((s, t) => s + t.sizeMb, 0).toFixed(0)} MB
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
