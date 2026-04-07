import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface DiffViewerProps {
  original: string
  modified: string
  language?: string
  className?: string
}

interface DiffLine {
  type: "unchanged" | "removed" | "added"
  content: string
  originalLineNo?: number
  modifiedLineNo?: number
}

function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split("\n")
  const modLines = modified.split("\n")
  const result: DiffLine[] = []

  let oi = 0
  let mi = 0
  let origLineNo = 1
  let modLineNo = 1

  while (oi < origLines.length || mi < modLines.length) {
    if (oi < origLines.length && mi < modLines.length && origLines[oi] === modLines[mi]) {
      result.push({ type: "unchanged", content: origLines[oi], originalLineNo: origLineNo, modifiedLineNo: modLineNo })
      oi++
      mi++
      origLineNo++
      modLineNo++
    } else if (oi < origLines.length && (mi >= modLines.length || !modLines.includes(origLines[oi]))) {
      result.push({ type: "removed", content: origLines[oi], originalLineNo: origLineNo })
      oi++
      origLineNo++
    } else if (mi < modLines.length) {
      result.push({ type: "added", content: modLines[mi], modifiedLineNo: modLineNo })
      mi++
      modLineNo++
    }
  }

  return result
}

export function DiffViewer({ original, modified, language, className }: DiffViewerProps) {
  const diff = useMemo(() => computeDiff(original, modified), [original, modified])

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {language && (
        <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
          {language}
        </div>
      )}
      <div className="grid grid-cols-2 divide-x divide-border">
        {/* Original */}
        <div>
          <div className="bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
            Original
          </div>
          <pre className="text-sm font-mono overflow-x-auto">
            {diff
              .filter((l) => l.type !== "added")
              .map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    line.type === "removed" && "bg-destructive/10"
                  )}
                >
                  <span className="w-12 shrink-0 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r border-border">
                    {line.originalLineNo ?? ""}
                  </span>
                  <span className={cn("px-4 py-0.5 whitespace-pre", line.type === "removed" && "text-destructive")}>
                    {line.type === "removed" && "- "}{line.content}
                  </span>
                </div>
              ))}
          </pre>
        </div>
        {/* Modified */}
        <div>
          <div className="bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
            Modified
          </div>
          <pre className="text-sm font-mono overflow-x-auto">
            {diff
              .filter((l) => l.type !== "removed")
              .map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    line.type === "added" && "bg-success/10"
                  )}
                >
                  <span className="w-12 shrink-0 px-2 py-0.5 text-right text-xs text-muted-foreground select-none border-r border-border">
                    {line.modifiedLineNo ?? ""}
                  </span>
                  <span className={cn("px-4 py-0.5 whitespace-pre", line.type === "added" && "text-success")}>
                    {line.type === "added" && "+ "}{line.content}
                  </span>
                </div>
              ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
