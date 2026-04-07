import { cn } from "@/lib/utils"

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: string
  readOnly?: boolean
  className?: string
  rows?: number
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  className,
  rows = 20,
}: CodeEditorProps) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {language && (
        <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">{language}</span>
          {readOnly && (
            <span className="text-xs text-muted-foreground">Read Only</span>
          )}
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        className={cn(
          "w-full resize-none bg-card p-4 font-mono text-sm text-foreground focus:outline-none",
          readOnly && "cursor-default"
        )}
      />
    </div>
  )
}
