import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LogViewer } from "@/components/LogViewer"
import { realtimeLogs } from "@/data/tools"
import { RefreshCw, Trash2, ArrowDownToLine } from "lucide-react"

type LogLevel = "info" | "warn" | "error" | "debug"

const levelConfig: Record<LogLevel, { label: string; color: string }> = {
  info: { label: "INFO", color: "bg-blue-500" },
  warn: { label: "WARN", color: "bg-yellow-500" },
  error: { label: "ERROR", color: "bg-red-500" },
  debug: { label: "DEBUG", color: "bg-gray-500" },
}

export default function LogViewerPage() {
  const [levelFilters, setLevelFilters] = useState<Record<LogLevel, boolean>>({
    info: true,
    warn: true,
    error: true,
    debug: true,
  })
  const [searchText, setSearchText] = useState("")
  const [autoScroll, setAutoScroll] = useState(true)
  const [logs, setLogs] = useState(realtimeLogs)

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!levelFilters[log.level as LogLevel]) return false
      if (searchText && !log.message.toLowerCase().includes(searchText.toLowerCase())) return false
      return true
    })
  }, [logs, levelFilters, searchText])

  function toggleLevel(level: LogLevel) {
    setLevelFilters((prev) => ({ ...prev, [level]: !prev[level] }))
  }

  const levelCounts = useMemo(() => {
    const counts: Record<LogLevel, number> = { info: 0, warn: 0, error: 0, debug: 0 }
    logs.forEach((log) => {
      if (log.level in counts) counts[log.level as LogLevel]++
    })
    return counts
  }, [logs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">로그 뷰어</h2>
          <p className="text-muted-foreground mt-1">OMA 실시간 로그 모니터링</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          총 {filteredLogs.length}건 / {logs.length}건
        </div>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Level checkboxes */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Level:</span>
              {(Object.keys(levelConfig) as LogLevel[]).map((level) => (
                <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={levelFilters[level]}
                    onChange={() => toggleLevel(level)}
                    className="rounded"
                  />
                  <span className="inline-flex items-center gap-1 text-sm">
                    <span className={`h-2 w-2 rounded-full ${levelConfig[level].color}`} />
                    {levelConfig[level].label}
                    <span className="text-muted-foreground">({levelCounts[level]})</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="로그 검색..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={autoScroll ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="gap-1"
              >
                <ArrowDownToLine className="h-3.5 w-3.5" />
                자동 스크롤
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogs([...realtimeLogs])}
                className="gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                새로고침
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogs([])}
                className="gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                지우기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log viewer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">실시간 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <LogViewer logs={filteredLogs} maxHeight="600px" />
        </CardContent>
      </Card>
    </div>
  )
}
