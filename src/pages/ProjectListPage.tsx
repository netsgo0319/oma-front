import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  FolderOpen,
  Plus,
  Database,
  ArrowRight,
  Sun,
  Moon,
  Table2,
  CheckSquare,
  Square,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProject } from "@/contexts/ProjectContext"
import { useTheme } from "@/hooks/useTheme"
import { Progress } from "@/components/ui/progress"
import type { FeaturePreset, MigrationScope } from "@/types/project"
import { tableCatalog, getSchemas, getTablesBySchema, getSchemaStats } from "@/data/table-catalog"

const presetLabels: Record<FeaturePreset, string> = {
  basic: "Basic",
  standard: "Standard",
  advanced: "Advanced",
}

const presetColors: Record<FeaturePreset, string> = {
  basic: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  standard: "bg-green-500/20 text-green-400 border-green-500/30",
  advanced: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

const statusLabels: Record<string, string> = {
  active: "진행 중",
  archived: "보관됨",
  paused: "일시 중지",
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  archived: "bg-gray-500/20 text-gray-400",
  paused: "bg-yellow-500/20 text-yellow-400",
}

export default function ProjectListPage() {
  const navigate = useNavigate()
  const { projects, createProject, switchProject } = useProject()
  const { theme, toggleTheme } = useTheme()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createStep, setCreateStep] = useState<1 | 2>(1)
  const [newName, setNewName] = useState("")
  const [newPreset, setNewPreset] = useState<FeaturePreset>("standard")
  const [scopeMode, setScopeMode] = useState<MigrationScope['mode']>("schema")
  const [selectedSchemas, setSelectedSchemas] = useState<Set<string>>(new Set())
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set())

  const schemas = useMemo(() => getSchemas(), [])

  const toggleSchema = (schema: string) => {
    setSelectedSchemas((prev) => {
      const next = new Set(prev)
      if (next.has(schema)) {
        next.delete(schema)
        // Also remove tables from this schema
        const schemaTables = getTablesBySchema(schema)
        schemaTables.forEach((t) => selectedTables.delete(t.fullName))
        setSelectedTables(new Set(selectedTables))
      } else {
        next.add(schema)
      }
      return next
    })
  }

  const toggleTable = (fullName: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev)
      if (next.has(fullName)) next.delete(fullName)
      else next.add(fullName)
      return next
    })
  }

  const scopeTableCount = scopeMode === 'all'
    ? tableCatalog.length
    : scopeMode === 'schema'
      ? [...selectedSchemas].reduce((sum, s) => sum + getTablesBySchema(s).length, 0)
      : selectedTables.size

  const handleCreate = () => {
    if (!newName.trim()) return
    if (createStep === 1) {
      setCreateStep(2)
      return
    }
    const scope: MigrationScope = {
      mode: scopeMode,
      selectedSchemas: [...selectedSchemas],
      selectedTables: [...selectedTables],
      description: scopeMode === 'all'
        ? `전체 ${tableCatalog.length}개 테이블`
        : scopeMode === 'schema'
          ? `${selectedSchemas.size}개 스키마 (${scopeTableCount}개 테이블)`
          : `${selectedTables.size}개 테이블 직접 선택`,
    }
    const proj = createProject(newName.trim(), newPreset, scope)
    resetCreateForm()
    switchProject(proj.id)
    navigate(`/project/${proj.id}`)
  }

  const resetCreateForm = () => {
    setNewName("")
    setShowCreateForm(false)
    setCreateStep(1)
    setScopeMode("schema")
    setSelectedSchemas(new Set())
    setSelectedTables(new Set())
  }

  const handleEnterProject = (projectId: string) => {
    switchProject(projectId)
    navigate(`/project/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
              O
            </div>
            <div>
              <h1 className="text-lg font-semibold">OMA WebUI</h1>
              <p className="text-xs text-muted-foreground">Oracle Migration Accelerator</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">프로젝트</h2>
            <p className="text-muted-foreground mt-1">
              마이그레이션 프로젝트를 선택하거나 새로 만드세요
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {projects.length}개 프로젝트
          </span>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const totalProgress =
              (proj.migrationProgress.dbMigration.percentage +
                proj.migrationProgress.appMigration.percentage +
                proj.migrationProgress.dataMigration.percentage) /
              3

            const sourceLabel =
              proj.settings.project.sourceDb.sid || "Oracle"
            const targetLabel =
              proj.settings.project.targetDb.database || "PostgreSQL"

            return (
              <button
                key={proj.id}
                onClick={() => handleEnterProject(proj.id)}
                className="group relative rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FolderOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                            presetColors[proj.featurePreset]
                          )}
                        >
                          {presetLabels[proj.featurePreset]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            statusColors[proj.status]
                          )}
                        >
                          {statusLabels[proj.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>

                {/* DB Info + Scope */}
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Database className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {sourceLabel} <span className="mx-1">→</span> {targetLabel}
                  </span>
                </div>
                {proj.migrationScope && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground/70">
                    <Table2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{proj.migrationScope.description}</span>
                  </div>
                )}

                {/* Progress */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">DB 마이그레이션</span>
                      <span className="font-medium">{proj.migrationProgress.dbMigration.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={proj.migrationProgress.dbMigration.percentage} colorClass="bg-blue-500" className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">앱 마이그레이션</span>
                      <span className="font-medium">{proj.migrationProgress.appMigration.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={proj.migrationProgress.appMigration.percentage} colorClass="bg-violet-500" className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">데이터 마이그레이션</span>
                      <span className="font-medium">{proj.migrationProgress.dataMigration.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={proj.migrationProgress.dataMigration.percentage} colorClass="bg-emerald-500" className="h-1.5" />
                  </div>
                </div>

                {/* Overall */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">전체 진행률</span>
                  <span className="text-sm font-bold text-foreground">{totalProgress.toFixed(1)}%</span>
                </div>
              </button>
            )
          })}

          {/* New Project Card */}
          {showCreateForm ? (
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-card p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold">새 프로젝트 만들기</h3>
                <span className="text-xs text-muted-foreground">— Step {createStep}/2</span>
              </div>

              {createStep === 1 ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">프로젝트 이름</label>
                    <input
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      placeholder="예: HR 모듈 1차 마이그레이션 (300 테이블)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newName.trim()) handleCreate()
                        if (e.key === "Escape") resetCreateForm()
                      }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">기능 프리셋</label>
                    <div className="flex gap-2">
                      {(["basic", "standard", "advanced"] as const).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setNewPreset(preset)}
                          className={cn(
                            "flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                            newPreset === preset
                              ? presetColors[preset]
                              : "border-border text-muted-foreground hover:border-foreground/20"
                          )}
                        >
                          {presetLabels[preset]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      다음: 테이블 범위 선택 →
                    </button>
                    <button
                      onClick={resetCreateForm}
                      className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Scope mode selector */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">마이그레이션 범위 선택 방식</label>
                    <div className="flex gap-2">
                      {([
                        { value: 'all' as const, label: '전체 테이블', desc: `${tableCatalog.length}개` },
                        { value: 'schema' as const, label: '스키마 단위', desc: `${schemas.length}개 스키마` },
                        { value: 'table' as const, label: '테이블 직접 선택', desc: '개별 지정' },
                      ]).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setScopeMode(opt.value)}
                          className={cn(
                            "flex-1 rounded-md border px-3 py-2 text-left transition-colors",
                            scopeMode === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-foreground/20"
                          )}
                        >
                          <span className="text-xs font-medium block">{opt.label}</span>
                          <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* All tables preview */}
                  {scopeMode === 'all' && (
                    <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">전체 {tableCatalog.length}개 테이블이 포함됩니다.</p>
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
                    </div>
                  )}

                  {/* Schema selection */}
                  {scopeMode === 'schema' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">스키마 선택</label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {schemas.map((schema) => {
                          const stats = getSchemaStats(schema)
                          const isSelected = selectedSchemas.has(schema)
                          return (
                            <button
                              key={schema}
                              onClick={() => toggleSchema(schema)}
                              className={cn(
                                "flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                                isSelected ? "border-primary bg-primary/10" : "border-border hover:border-foreground/20"
                              )}
                            >
                              {isSelected ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                              <div className="min-w-0">
                                <span className="text-xs font-medium block">{schema}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {stats.tableCount}개 테이블 · {stats.totalRows.toLocaleString()} rows · {stats.totalSizeMb.toFixed(0)} MB
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Table selection */}
                  {scopeMode === 'table' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">테이블 선택 ({selectedTables.size}개 선택됨)</label>
                      <div className="max-h-56 overflow-y-auto rounded-md border border-border">
                        {schemas.map((schema) => (
                          <div key={schema}>
                            <div className="sticky top-0 bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                              {schema} ({getTablesBySchema(schema).length})
                            </div>
                            {getTablesBySchema(schema).map((t) => {
                              const isSelected = selectedTables.has(t.fullName)
                              return (
                                <button
                                  key={t.fullName}
                                  onClick={() => toggleTable(t.fullName)}
                                  className={cn(
                                    "flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-accent/50 transition-colors",
                                    isSelected && "bg-primary/5"
                                  )}
                                >
                                  {isSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0" /> : <Square className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />}
                                  <span className="text-xs flex-1 truncate">{t.tableName}</span>
                                  <span className="text-[10px] text-muted-foreground shrink-0">{t.rowCount.toLocaleString()} rows</span>
                                  <span className="text-[10px] text-muted-foreground shrink-0">{t.sizeMb} MB</span>
                                </button>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary + actions */}
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    선택된 범위: <span className="font-medium text-foreground">{scopeTableCount}개 테이블</span>
                    {scopeMode === 'schema' && selectedSchemas.size > 0 && (
                      <span> ({[...selectedSchemas].join(', ')})</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setCreateStep(1)}
                      className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                    >
                      ← 이전
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={scopeMode !== 'all' && scopeTableCount === 0}
                      className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      프로젝트 만들기 ({scopeTableCount}개 테이블)
                    </button>
                    <button
                      onClick={resetCreateForm}
                      className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5 min-h-[280px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">새 프로젝트 만들기</span>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
