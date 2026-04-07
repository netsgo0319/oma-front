import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { agentLogs } from "@/data/tools"
import { ChevronDown, ChevronRight, Bot, Wrench, Brain, ArrowRight } from "lucide-react"

const agents = [
  { value: "all", label: "전체 Agent" },
  { value: "Discovery", label: "Discovery" },
  { value: "Schema Architect", label: "Schema Architect" },
  { value: "Code Migrator", label: "Code Migrator" },
  { value: "QA Verifier", label: "QA Verifier" },
  { value: "Evaluator", label: "Evaluator" },
]

const agentColors: Record<string, string> = {
  Discovery: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  "Schema Architect": "bg-blue-500/10 text-blue-700 border-blue-500/30",
  "Code Migrator": "bg-green-500/10 text-green-700 border-green-500/30",
  "QA Verifier": "bg-orange-500/10 text-orange-700 border-orange-500/30",
  Evaluator: "bg-rose-500/10 text-rose-700 border-rose-500/30",
}

export default function AgentLogPage() {
  const [selectedAgent, setSelectedAgent] = useState("all")
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())

  const filteredLogs = selectedAgent === "all"
    ? agentLogs
    : agentLogs.filter((l) => l.agent === selectedAgent)

  function toggleEntry(index: number) {
    setExpandedEntries((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent 로그 뷰어</h2>
          <p className="text-muted-foreground mt-1">AI Agent 실행 과정 (qlog) 타임라인</p>
        </div>
        <div className="w-64">
          <Select
            options={agents}
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          />
        </div>
      </div>

      {/* Agent summary */}
      <div className="flex gap-2 flex-wrap">
        {agents.slice(1).map((agent) => {
          const count = agentLogs.filter((l) => l.agent === agent.value).length
          return (
            <button
              key={agent.value}
              onClick={() => setSelectedAgent(selectedAgent === agent.value ? "all" : agent.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedAgent === agent.value || selectedAgent === "all"
                  ? agentColors[agent.value]
                  : "bg-muted text-muted-foreground border-border opacity-50"
              }`}
            >
              {agent.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">실행 타임라인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-1">
              {filteredLogs.map((entry, i) => {
                const isExpanded = expandedEntries.has(i)
                const colorClass = agentColors[entry.agent] ?? "bg-muted text-muted-foreground border-border"
                return (
                  <div key={i} className="relative pl-14">
                    {/* Timeline dot */}
                    <div className={`absolute left-[18px] top-4 h-3 w-3 rounded-full border-2 border-background ${
                      entry.agent === "QA Verifier" && entry.output.startsWith("ERROR")
                        ? "bg-red-500"
                        : entry.agent === "Evaluator"
                          ? "bg-rose-500"
                          : "bg-primary"
                    }`} />

                    <div
                      className={`rounded-lg border border-border p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        isExpanded ? "bg-muted/30" : ""
                      }`}
                      onClick={() => toggleEntry(i)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <Bot className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <Badge className={`shrink-0 ${colorClass}`}>
                            {entry.agent}
                          </Badge>
                          <span className="text-sm font-medium truncate">{entry.action}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Wrench className="h-3 w-3" />
                            {entry.tool}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString("ko-KR", {
                              hour: "2-digit", minute: "2-digit", second: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 space-y-3 ml-6">
                          {/* Thinking */}
                          {entry.thinking && (
                            <div className="rounded-md bg-yellow-500/5 border border-yellow-500/20 p-3">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Brain className="h-3.5 w-3.5 text-yellow-600" />
                                <span className="text-xs font-semibold text-yellow-600">Thinking</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{entry.thinking}</p>
                            </div>
                          )}

                          {/* Input / Output */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-md bg-muted/50 p-3">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground">Input</span>
                              </div>
                              <p className="text-sm font-mono break-all">{entry.input}</p>
                            </div>
                            <div className={`rounded-md p-3 ${
                              entry.output.startsWith("ERROR")
                                ? "bg-red-500/5 border border-red-500/20"
                                : "bg-green-500/5 border border-green-500/20"
                            }`}>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <ArrowRight className="h-3.5 w-3.5 rotate-180 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground">Output</span>
                              </div>
                              <p className={`text-sm font-mono break-all ${
                                entry.output.startsWith("ERROR") ? "text-red-600" : ""
                              }`}>{entry.output}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
