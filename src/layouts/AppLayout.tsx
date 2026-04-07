import { useState, useCallback } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

interface SubItem {
  label: string
  path: string
}

interface MenuGroup {
  label: string
  icon: React.ElementType
  path?: string
  children?: SubItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "\uB300\uC2DC\uBCF4\uB4DC",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uB9C8\uC774\uADF8\uB808\uC774\uC158",
    icon: Database,
    children: [
      { label: "DMS SC \uC2E4\uD589", path: "/db-migration/dms-execution" },
      { label: "DMS SC \uACB0\uACFC", path: "/db-migration/dms-results" },
      { label: "AI \uC5D0\uC774\uC804\uD2B8 \uC2A4\uD0A4\uB9C8 \uBCC0\uD658", path: "/db-migration/ai-schema" },
      { label: "PostgreSQL \uC2A4\uD0A4\uB9C8 \uAC80\uC99D", path: "/db-migration/schema-validation" },
      { label: "\uBCC0\uD658 \uCEE8\uD14D\uC2A4\uD2B8 \uAD00\uB9AC", path: "/db-migration/context" },
    ],
  },
  {
    label: "\uC560\uD50C\uB9AC\uCF00\uC774\uC158 \uB9C8\uC774\uADF8\uB808\uC774\uC158",
    icon: AppWindow,
    children: [
      { label: "Mapper \uD30C\uC77C \uD0D0\uC0C9\uAE30", path: "/app-migration/mapper-explorer" },
      { label: "SQL \uCD94\uCD9C", path: "/app-migration/sql-extraction" },
      { label: "SQL \uD544\uD130\uB9C1", path: "/app-migration/sql-filtering" },
      { label: "\uCFFC\uB9AC \uBCC0\uD658", path: "/app-migration/query-rewrite" },
      { label: "\uC218\uB3D9 \uAC80\uD1A0", path: "/app-migration/manual-review" },
      { label: "XML \uBCD1\uD569", path: "/app-migration/xml-merge" },
      { label: "\uD14C\uC2A4\uD2B8 \uC9C0\uC6D0", path: "/app-migration/test-support" },
    ],
  },
  {
    label: "\uB370\uC774\uD130 \uB9C8\uC774\uADF8\uB808\uC774\uC158",
    icon: Package,
    children: [
      { label: "\uB370\uC774\uD130 \uB9C8\uC774\uADF8\uB808\uC774\uC158 \uC2E4\uD589", path: "/data-migration/execution" },
      { label: "\uB370\uC774\uD130 \uAC80\uC99D", path: "/data-migration/validation" },
    ],
  },
  {
    label: "\uB3C4\uAD6C",
    icon: Wrench,
    children: [
      { label: "SQL \uC2E4\uD589\uAE30", path: "/tools/sql-executor" },
      { label: "\uB85C\uADF8 \uBDF0\uC5B4", path: "/tools/log-viewer" },
      { label: "\uC5D0\uC774\uC804\uD2B8 \uB85C\uADF8 \uBDF0\uC5B4", path: "/tools/agent-log" },
      { label: "\uBCC0\uD658 \uBCF4\uACE0\uC11C", path: "/tools/report" },
      { label: "\uC9C0\uC2DD \uBCA0\uC774\uC2A4", path: "/tools/knowledge-base" },
    ],
  },
  {
    label: "\uC124\uC815",
    icon: Settings,
    children: [
      { label: "\uD504\uB85C\uC81D\uD2B8 \uC124\uC815", path: "/settings/project" },
      { label: "\uC5D0\uC774\uC804\uD2B8 \uC124\uC815", path: "/settings/agent" },
      { label: "\uD14C\uC2A4\uD2B8 \uC124\uC815", path: "/settings/test" },
    ],
  },
]

function getBreadcrumb(pathname: string): string[] {
  for (const group of menuGroups) {
    if (group.path === pathname) return [group.label]
    if (group.children) {
      for (const child of group.children) {
        if (child.path === pathname) return [group.label, child.label]
      }
    }
  }
  return ["\uB300\uC2DC\uBCF4\uB4DC"]
}

function getPageTitle(pathname: string): string {
  for (const group of menuGroups) {
    if (group.path === pathname) return group.label
    if (group.children) {
      for (const child of group.children) {
        if (child.path === pathname) return child.label
      }
    }
  }
  return "\uB300\uC2DC\uBCF4\uB4DC"
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const breadcrumb = getBreadcrumb(location.pathname)
  const pageTitle = getPageTitle(location.pathname)

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
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-white font-bold text-sm shrink-0">
            O
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold truncate">OMA WebUI</span>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {menuGroups.map((group) => {
            const Icon = group.icon
            const isActive = isActiveGroup(group)
            const isExpanded = expandedGroups.has(group.label)

            if (group.path) {
              return (
                <NavLink
                  key={group.label}
                  to={group.path}
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
              <span>{theme === "dark" ? "\uB77C\uC774\uD2B8 \uBAA8\uB4DC" : "\uB2E4\uD06C \uBAA8\uB4DC"}</span>
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
                <span>\uC0AC\uC774\uB4DC\uBC14 \uC811\uAE30</span>
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
