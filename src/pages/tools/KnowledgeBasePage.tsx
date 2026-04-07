import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { conversionPatterns } from "@/data/tools"
import { Search, Plus, ArrowRight, X, BookOpen } from "lucide-react"

const categoryTabs = [
  { value: "all", label: "All" },
  { value: "Function", label: "함수 변환" },
  { value: "Syntax", label: "구문 변환" },
  { value: "Data Type", label: "데이터타입" },
  { value: "other", label: "기타" },
]

const primaryCategories = ["Function", "Syntax", "Data Type"]

const categoryColors: Record<string, string> = {
  Function: "bg-blue-500/10 text-blue-700",
  "Date/Time": "bg-purple-500/10 text-purple-700",
  Pagination: "bg-orange-500/10 text-orange-700",
  Hierarchical: "bg-green-500/10 text-green-700",
  Sequence: "bg-pink-500/10 text-pink-700",
  Syntax: "bg-gray-500/10 text-gray-700",
  "Set Operator": "bg-cyan-500/10 text-cyan-700",
  Join: "bg-indigo-500/10 text-indigo-700",
  Aggregate: "bg-teal-500/10 text-teal-700",
  Regex: "bg-rose-500/10 text-rose-700",
  DML: "bg-amber-500/10 text-amber-700",
  "Data Type": "bg-emerald-500/10 text-emerald-700",
}

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredPatterns = useMemo(() => {
    return conversionPatterns.filter((p) => {
      if (activeCategory === "other") {
        if (primaryCategories.includes(p.category)) return false
      } else if (activeCategory !== "all" && p.category !== activeCategory) {
        return false
      }
      if (search) {
        const q = search.toLowerCase()
        return (
          p.oraclePattern.toLowerCase().includes(q) ||
          p.postgresPattern.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, activeCategory])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground mt-1">Oracle → PostgreSQL 변환 패턴 지식 베이스</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          커스텀 규칙 추가
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="패턴 검색... (예: NVL, ROWNUM, SYSDATE)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Patterns table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              변환 패턴 ({filteredPatterns.length}건)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oracle Pattern</TableHead>
                <TableHead className="w-8"></TableHead>
                <TableHead>PostgreSQL Pattern</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>설명</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatterns.map((pattern) => (
                <tbody key={pattern.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id)}
                  >
                    <TableCell>
                      <code className="bg-orange-500/10 text-orange-700 px-2 py-1 rounded text-xs font-mono">
                        {pattern.oraclePattern}
                      </code>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <code className="bg-blue-500/10 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                        {pattern.postgresPattern}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryColors[pattern.category] ?? "bg-muted text-muted-foreground"}>
                        {pattern.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{pattern.description}</TableCell>
                  </TableRow>
                  {expandedPattern === pattern.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Example:</p>
                          <pre className="bg-card border border-border rounded-lg p-3 text-sm font-mono overflow-auto">
                            {pattern.example}
                          </pre>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </tbody>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Custom Rule Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-[600px] max-h-[80vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">커스텀 규칙 추가</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAddDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Oracle Pattern</label>
                <Input placeholder="예: TO_DATE(str, fmt)" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">PostgreSQL Pattern</label>
                <Input placeholder="예: TO_DATE(str, fmt)" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Input placeholder="예: Function, Syntax, Data Type" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">설명</label>
                <Input placeholder="변환 규칙에 대한 설명" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Example</label>
                <textarea
                  placeholder="Oracle 예시 → PostgreSQL 예시"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  취소
                </Button>
                <Button onClick={() => setShowAddDialog(false)}>
                  추가
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
