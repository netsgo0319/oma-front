import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { projectSettings } from "@/data/settings"
import { Save, Plug, CheckCircle2, Loader2, Database, Server } from "lucide-react"

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
    </div>
  )
}
