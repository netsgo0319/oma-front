import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { filterResults, extractedSqls } from "@/data/app-migration"

type Category = "needsConversion" | "newQuery" | "noConversionNeeded"

interface FilterRule {
  id: string
  field: string
  operator: string
  value: string
}

const categoryLabels: Record<Category, string> = {
  needsConversion: "변환 필요",
  newQuery: "신규 쿼리",
  noConversionNeeded: "변환 불필요",
}

const categoryColors: Record<Category, string> = {
  needsConversion: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
  newQuery: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
  noConversionNeeded: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
}

export default function SqlFilteringPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all")
  const [items, setItems] = useState(filterResults.items)
  const [filterRules, setFilterRules] = useState<FilterRule[]>([])
  const [showFilterCriteria, setShowFilterCriteria] = useState(false)

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items
    return items.filter((item) => item.category === activeCategory)
  }, [items, activeCategory])

  const counts = useMemo(() => {
    const result = { needsConversion: 0, newQuery: 0, noConversionNeeded: 0 }
    for (const item of items) {
      result[item.category]++
    }
    return result
  }, [items])

  const handleCategoryChange = (sqlId: string, newCategory: Category) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sqlId === sqlId ? { ...item, category: newCategory } : item
      )
    )
  }

  const addFilterRule = () => {
    setFilterRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), field: "sqlType", operator: "equals", value: "" },
    ])
  }

  const removeFilterRule = (id: string) => {
    setFilterRules((prev) => prev.filter((r) => r.id !== id))
  }

  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    setFilterRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const getSqlInfo = (sqlId: string) => {
    return extractedSqls.find((s) => s.id === sqlId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">SQL 필터링</h2>
        <p className="text-sm text-muted-foreground mt-1">
          추출된 SQL을 분류하고 변환 대상을 결정합니다
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(
          [
            { key: "needsConversion" as Category, icon: "!" },
            { key: "newQuery" as Category, icon: "+" },
            { key: "noConversionNeeded" as Category, icon: "-" },
          ] as const
        ).map(({ key }) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${
              activeCategory === key ? "ring-2 ring-primary" : ""
            } ${categoryColors[key]} border`}
            onClick={() => setActiveCategory(activeCategory === key ? "all" : key)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">
                    {categoryLabels[key]}
                  </p>
                  <p className="text-3xl font-bold mt-1">{counts[key]}</p>
                </div>
                {activeCategory === key && (
                  <Badge variant="outline" className="text-xs">
                    선택됨
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("all")}
        >
          전체 ({items.length})
        </Button>
        {(Object.keys(categoryLabels) as Category[]).map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {categoryLabels[cat]} ({counts[cat]})
          </Button>
        ))}
      </div>

      {/* Custom Filter Criteria */}
      <Card>
        <CardHeader
          className="py-3 px-6 cursor-pointer"
          onClick={() => setShowFilterCriteria(!showFilterCriteria)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {showFilterCriteria ? "\u25BC" : "\u25B6"} 사용자 정의 필터 규칙
              {filterRules.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filterRules.length}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                addFilterRule()
                setShowFilterCriteria(true)
              }}
            >
              + 규칙 추가
            </Button>
          </div>
        </CardHeader>
        {showFilterCriteria && (
          <CardContent className="pt-0 space-y-2">
            {filterRules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                필터 규칙이 없습니다. &quot;+ 규칙 추가&quot; 버튼을 클릭하세요.
              </p>
            ) : (
              filterRules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                  <select
                    value={rule.field}
                    onChange={(e) => updateFilterRule(rule.id, { field: e.target.value })}
                    className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                  >
                    <option value="sqlType">SQL Type</option>
                    <option value="complexity">Complexity</option>
                    <option value="mapper">Mapper</option>
                    <option value="oracleSpecific">Oracle 전용</option>
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => updateFilterRule(rule.id, { operator: e.target.value })}
                    className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                  >
                    <option value="equals">같음</option>
                    <option value="notEquals">같지 않음</option>
                    <option value="contains">포함</option>
                  </select>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                    placeholder="값 입력..."
                    className="h-9 flex-1 rounded-md border border-border bg-card px-3 text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilterRule(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    삭제
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>

      {/* Results Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">SQL ID</TableHead>
              <TableHead className="w-40">분류</TableHead>
              <TableHead className="w-64">사유</TableHead>
              <TableHead>Original SQL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const sqlInfo = getSqlInfo(item.sqlId)
              return (
                <TableRow key={item.sqlId}>
                  <TableCell className="font-mono text-xs">{item.sqlId}</TableCell>
                  <TableCell>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        handleCategoryChange(item.sqlId, e.target.value as Category)
                      }
                      className={`h-8 rounded-md border px-2 text-xs font-medium ${
                        item.category === "needsConversion"
                          ? "border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30"
                          : item.category === "newQuery"
                            ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                            : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                      }`}
                    >
                      <option value="needsConversion">변환 필요</option>
                      <option value="newQuery">신규 쿼리</option>
                      <option value="noConversionNeeded">변환 불필요</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.reason}
                  </TableCell>
                  <TableCell>
                    <pre className="text-xs font-mono text-muted-foreground truncate max-w-lg">
                      {sqlInfo
                        ? sqlInfo.originalSql.length > 100
                          ? sqlInfo.originalSql.slice(0, 100) + "..."
                          : sqlInfo.originalSql
                        : "-"}
                    </pre>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
