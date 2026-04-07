import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { agentSettings } from "@/data/settings"
import { Save, CheckCircle2, Bot } from "lucide-react"

export default function AgentSettingsPage() {
  const [settings, setSettings] = useState(agentSettings)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update<K extends keyof typeof agentSettings>(key: K, value: (typeof agentSettings)[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent 설정</h2>
          <p className="text-muted-foreground mt-1">AI Agent 모델 및 동작 파라미터 설정</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Model 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Model ID</label>
              <Input
                value={settings.modelId}
                onChange={(e) => update("modelId", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Region</label>
              <Input
                value={settings.region}
                onChange={(e) => update("region", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">실행 파라미터</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Max remediation retries */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Remediation 최대 재시도 횟수</label>
              <span className="text-sm font-mono text-muted-foreground">{settings.maxRemediationRetries}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={settings.maxRemediationRetries}
              onChange={(e) => update("maxRemediationRetries", Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Evaluator threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Evaluator GO/NO-GO 임계점수</label>
              <span className="text-sm font-mono text-muted-foreground">{settings.evaluatorThreshold}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.evaluatorThreshold}
              onChange={(e) => update("evaluatorThreshold", Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* Max query retries */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">쿼리 재작성 최대 재시도 횟수</label>
              <span className="text-sm font-mono text-muted-foreground">{settings.maxQueryRetries}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={settings.maxQueryRetries}
              onChange={(e) => update("maxQueryRetries", Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Context budget */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Context Budget</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.contextBudget}
                onChange={(e) => update("contextBudget", Number(e.target.value))}
                className="w-48"
              />
              <span className="text-sm text-muted-foreground">tokens</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({(settings.contextBudget / 1000).toFixed(0)}K)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
