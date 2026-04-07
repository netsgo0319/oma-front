import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
}

interface LogViewerProps {
  logs: LogEntry[]
  className?: string
  maxHeight?: string
}

const levelStyles: Record<LogLevel, string> = {
  info: "text-info",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-muted-foreground",
}

const levelLabels: Record<LogLevel, string> = {
  info: "INFO ",
  warn: "WARN ",
  error: "ERROR",
  debug: "DEBUG",
}

export function LogViewer({ logs, className, maxHeight = "400px" }: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div
      ref={containerRef}
      className={cn(
        "rounded-lg border border-border bg-card overflow-auto font-mono text-xs",
        className
      )}
      style={{ maxHeight }}
    >
      <div className="p-3 space-y-0.5">
        {logs.length === 0 && (
          <p className="text-muted-foreground text-center py-4">No logs available</p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 leading-5">
            <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
            <span className={cn("shrink-0 font-semibold", levelStyles[log.level])}>
              [{levelLabels[log.level]}]
            </span>
            <span className="text-foreground break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
