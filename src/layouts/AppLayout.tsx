import { useState, useCallback, useMemo, useEffect } from "react"
import { Outlet, NavLink, useLocation, useParams, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Database,
  AppWindow,
  Package,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"
import { useProject } from "@/contexts/ProjectContext"
import type { FeatureKey, FeaturePreset } from "@/types/project"
import WorkflowStepIndicator from "@/components/WorkflowStepIndicator"
import OnboardingModal from "@/components/OnboardingModal"

interface SubItem {
  label: string
  path: string
  featureKey?: FeatureKey
}

interface MenuGroup {
  label: string
  icon: React.ElementType
  path?: string
  featureKey?: FeatureKey
  children?: SubItem[]
}

/** Menu definitions using relative paths (will be prefixed with /project/:id) */
const menuGroups: MenuGroup[] = [
  {
    label: "대시보드",
    icon: LayoutDashboard,
    path: "",
    featureKey: "dashboard",
  },
  {
    label: "데이터베이스 마이그레이션",
    icon: Database,
    children: [
      { label: "DMS SC 실행", path: "db-migration/dms-execution", featureKey: "dmsExecution" },
      { label: "DMS SC 결과", path: "db-migration/dms-results", featureKey: "dmsResults" },
      { label: "AI 에이전트 스키마 변환", path: "db-migration/ai-schema", featureKey: "aiSchema" },
      { label: "PostgreSQL 스키마 검증", path: "db-migration/schema-validation", featureKey: "schemaValidation" },
      { label: "변환 컨텍스트 관리", path: "db-migration/context", featureKey: "conversionContext" },
    ],
  },
  {
    label: "애플리케이션 마이그레이션",
    icon: AppWindow,
    children: [
      { label: "Mapper 파일 탐색기", path: "app-migration/mapper-explorer", featureKey: "mapperExplorer" },
      { label: "SQL 추출", path: "app-migration/sql-extraction", featureKey: "sqlExtraction" },
      { label: "SQL 필터링", path: "app-migration/sql-filtering", featureKey: "sqlFiltering" },
      { label: "쿼리 변환", path: "app-migration/query-rewrite", featureKey: "queryRewrite" },
      { label: "수동 검토", path: "app-migration/manual-review", featureKey: "manualReview" },
      { label: "XML 병합", path: "app-migration/xml-merge", featureKey: "xmlMerge" },
      { label: "테스트 지원", path: "app-migration/test-support", featureKey: "testSupport" },
    ],
  },
  {
    label: "데이터 마이그레이션",
    icon: Package,
    children: [
      { label: "데이터 마이그레이션 실행", path: "data-migration/execution", featureKey: "dataExecution" },
      { label: "데이터 검증", path: "data-migration/validation", featureKey: "dataValidation" },
    ],
  },
  {
    label: "도구",
    icon: Wrench,
    children: [
      { label: "SQL 실행기", path: "tools/sql-executor", featureKey: "sqlExecutor" },
      { label: "로그 뷰어", path: "tools/log-viewer", featureKey: "logViewer" },
      { label: "에이전트 로그 뷰어", path: "tools/agent-log", featureKey: "agentLog" },
      { label: "변환 보고서", path: "tools/report", featureKey: "conversionReport" },
      { label: "지식 베이스", path: "tools/knowledge-base", featureKey: "knowledgeBase" },
    ],
  },
  {
    label: "설정",
    icon: Settings,
    children: [
      { label: "프로젝트 설정", path: "settings/project" },
      { label: "에이전트 설정", path: "settings/agent" },
      { label: "테스트 설정", path: "settings/test" },
      { label: "기능 관리", path: "settings/features" },
    ],
  },
]

const presetLabels: Record<FeaturePreset, string> = {
  basic: "Basic",
  standard: "Standard",
  advanced: "Advanced",
}

const presetColors: Record<FeaturePreset, string> = {
  basic: "bg-blue-500/20 text-blue-400",
  standard: "bg-green-500/20 text-green-400",
  advanced: "bg-purple-500/20 text-purple-400",
}

function resolveMenuPaths(groups: MenuGroup[], base: string): MenuGroup[] {
  return groups.map((g) => ({
    ...g,
    path: g.path !== undefined ? `${base}${g.path ? `/${g.path}` : ""}` : undefined,
    children: g.children?.map((c) => ({ ...c, path: `${base}/${c.path}` })),
  }))
}

function getBreadcrumb(pathname: string, visibleGroups: MenuGroup[]): string[] {
  for (const group of visibleGroups) {
    if (group.path === pathname) return [group.label]
    if (group.children) {
      for (const child of group.children) {
        if (child.path === pathname) return [group.label, child.label]
      }
    }
  }
  return ["대시보드"]
}

function getPageTitle(pathname: string, visibleGroups: MenuGroup[]): string {
  for (const group of visibleGroups) {
    if (group.path === pathname) return group.label
    if (group.children) {
      for (const child of group.children) {
        if (child.path === pathname) return child.label
      }
    }
  }
  return "대시보드"
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const {
    activeProject,
    switchProject,
    isFeatureEnabled,
  } = useProject()

  // Sync project from URL param
  useEffect(() => {
    if (projectId && projectId !== activeProject?.id) {
      switchProject(projectId)
    }
  }, [projectId, activeProject?.id, switchProject])

  const basePath = `/project/${projectId}`

  // Resolve menu paths with project prefix and filter by feature flags
  const visibleMenuGroups = useMemo(() => {
    const resolved = resolveMenuPaths(menuGroups, basePath)
    return resolved
      .filter((group) => {
        if (group.featureKey && !isFeatureEnabled(group.featureKey)) return false
        if (group.children) {
          const visibleChildren = group.children.filter(
            (child) => !child.featureKey || isFeatureEnabled(child.featureKey)
          )
          return visibleChildren.length > 0
        }
        return true
      })
      .map((group) => {
        if (!group.children) return group
        return {
          ...group,
          children: group.children.filter(
            (child) => !child.featureKey || isFeatureEnabled(child.featureKey)
          ),
        }
      })
  }, [isFeatureEnabled, basePath])

  const breadcrumb = getBreadcrumb(location.pathname, visibleMenuGroups)
  const pageTitle = getPageTitle(location.pathname, visibleMenuGroups)

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }, [])

  const isActiveGroup = useCallback(
    (group: MenuGroup): boolean => {
      if (group.path) return location.pathname === group.path
      return group.children?.some((c) => location.pathname === c.path) ?? false
    },
    [location.pathname]
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 shrink-0",
          collapsed ? "w-[60px]" : "w-[260px]"
        )}
      >
        {/* Logo + Project Info */}
        <div className="border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 px-4 h-14">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm shrink-0">
              O
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold truncate">OMA WebUI</span>
            )}
          </div>

          {/* Back to project list + project name */}
          {!collapsed && (
            <div className="px-3 pb-3 space-y-2">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>프로젝트 목록</span>
              </button>

              {activeProject && (
                <div className="rounded-md border border-sidebar-border px-3 py-2">
                  <div className="text-xs font-medium truncate">
                    {activeProject.name}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        presetColors[activeProject.featurePreset]
                      )}
                    >
                      {presetLabels[activeProject.featurePreset]}
                    </span>
                    <span className="text-[10px] text-sidebar-foreground/40 truncate">
                      {activeProject.settings.project.sourceDb.host
                        ? `${activeProject.settings.project.sourceDb.sid || "Oracle"} → ${activeProject.settings.project.targetDb.database || "PostgreSQL"}`
                        : "설정 필요"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {visibleMenuGroups.map((group) => {
            const Icon = group.icon
            const isActive = isActiveGroup(group)
            const isExpanded = expandedGroups.has(group.label)

            if (group.path) {
              return (
                <NavLink
                  key={group.label}
                  to={group.path}
                  end
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{group.label}</span>}
                </NavLink>
              )
            }

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent/50 text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{group.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isExpanded && group.children && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {group.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-xs transition-colors",
                          location.pathname === child.path
                            ? "bg-sidebar-accent text-sidebar-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-2 py-2 space-y-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 shrink-0" />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "라이트 모드" : "다크 모드"}</span>
            )}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>사이드바 접기</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center h-14 border-b border-border bg-background px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">/</span>}
                <span className={i === breadcrumb.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
          <div className="ml-auto">
            <h1 className="text-sm font-semibold">{pageTitle}</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <WorkflowStepIndicator />
          <Outlet />
        </main>

        {/* Onboarding Modal (first visit) */}
        <OnboardingModal />
      </div>
    </div>
  )
}
