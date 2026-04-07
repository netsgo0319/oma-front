import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { reportSections } from "@/data/tools"
import { FileText, Download, Loader2, CheckCircle2 } from "lucide-react"

function ScoreGauge({ score }: { score: number }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? "#22c55e" : score >= 70 ? "#eab308" : "#ef4444"

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-muted" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

function ReportSection({ title, content }: { title: string; content: string }) {
  const lines = content.split("\n")

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold border-b-2 border-primary pb-2 mb-4">{title}</h3>
      <div className="space-y-1 text-sm leading-relaxed">
        {lines.map((line, i) => {
          const trimmed = line.trim()
          if (!trimmed) return <div key={i} className="h-2" />
          if (trimmed.startsWith("## "))
            return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{trimmed.replace("## ", "")}</h2>
          if (trimmed.startsWith("### "))
            return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{trimmed.replace("### ", "")}</h3>
          if (trimmed.startsWith("**") && trimmed.endsWith("**"))
            return <p key={i} className="font-semibold">{trimmed.replace(/\*\*/g, "")}</p>
          if (trimmed.startsWith("**")) {
            const parts = trimmed.split("**")
            return (
              <p key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                )}
              </p>
            )
          }
          if (trimmed.startsWith("- "))
            return <li key={i} className="ml-4 list-disc text-muted-foreground">{trimmed.replace("- ", "")}</li>
          if (trimmed.match(/^\d+\. /))
            return <li key={i} className="ml-4 list-decimal text-muted-foreground">{trimmed.replace(/^\d+\.\s/, "")}</li>
          if (trimmed.startsWith("|")) {
            if (trimmed.includes("---")) return null
            const cells = trimmed.split("|").filter(Boolean).map((c) => c.trim())
            const isHeader = lines[i + 1]?.trim().includes("---")
            return (
              <div
                key={i}
                className={`grid font-mono text-xs py-1.5 px-2 ${isHeader ? "font-bold bg-muted rounded" : "border-b border-border"}`}
                style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}
              >
                {cells.map((cell, j) => (
                  <span key={j} className="px-2">{cell}</span>
                ))}
              </div>
            )
          }
          return <p key={i} className="text-muted-foreground">{trimmed}</p>
        })}
      </div>
    </div>
  )
}

export default function ConversionReportPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)

  function handleGenerate() {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setIsGenerated(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">변환 리포트</h2>
          <p className="text-muted-foreground mt-1">Oracle → PostgreSQL 마이그레이션 변환 리포트</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                보고서 생성
              </>
            )}
          </Button>
          {isGenerated && (
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              다운로드
            </Button>
          )}
        </div>
      </div>

      {!isGenerated && !isGenerating && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">&quot;보고서 생성&quot; 버튼을 클릭하여 리포트를 생성하세요.</p>
          </CardContent>
        </Card>
      )}

      {isGenerating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">리포트를 생성하고 있습니다...</p>
            <p className="text-xs text-muted-foreground mt-1">데이터 분석 및 결과 집계 중</p>
          </CardContent>
        </Card>
      )}

      {isGenerated && (
        <>
          {/* Score overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4">종합 변환 점수</p>
                <ScoreGauge score={91} />
                <Badge variant="success" className="mt-4 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  GO
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-3">핵심 지표</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SQL 변환 성공률</span>
                    <span className="font-bold text-green-600">91.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">스키마 자동 변환률</span>
                    <span className="font-bold text-green-600">83.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">데이터 정합성</span>
                    <span className="font-bold text-yellow-600">89.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">테스트 통과율</span>
                    <span className="font-bold text-green-600">79.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-3">잔여 작업</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">수동 변환 필요</span>
                    <Badge variant="destructive">2건</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">수동 검토 필요</span>
                    <Badge variant="warning">85건</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">데이터 재이관</span>
                    <Badge variant="destructive">1건</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">테스트 실패</span>
                    <Badge variant="warning">2건</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report document */}
          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">리포트 본문</CardTitle>
                <span className="text-xs text-muted-foreground">생성일: 2026-04-06</span>
              </div>
            </CardHeader>
            <CardContent className="p-8 max-w-4xl mx-auto">
              <div className="text-center mb-10 pb-6 border-b-2 border-primary">
                <h1 className="text-2xl font-bold">Oracle → PostgreSQL Migration Report</h1>
                <p className="text-muted-foreground mt-2">OMA 데모 시스템 마이그레이션 프로젝트</p>
                <p className="text-xs text-muted-foreground mt-1">Report generated: 2026-04-06 | OMA Engine v2.4.1</p>
              </div>
              {reportSections.map((section, i) => (
                <ReportSection key={i} title={section.title} content={section.content} />
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
