import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { CodeEditor } from "@/components/CodeEditor"
import { mapperFiles } from "@/data/app-migration"

interface TreeNode {
  name: string
  path: string
  children: TreeNode[]
  file?: (typeof mapperFiles)[number]
}

function buildTree(files: typeof mapperFiles): TreeNode {
  const root: TreeNode = { name: "mapper", path: "mapper", children: [] }

  for (const file of files) {
    const parts = file.path.replace("src/main/resources/mapper/", "").split("/")
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      let child = current.children.find((c) => c.name === part)
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          children: [],
          file: isFile ? file : undefined,
        }
        current.children.push(child)
      }
      current = child
    }
  }
  return root
}

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: TreeNode
  depth: number
  selectedPath: string | null
  onSelect: (file: (typeof mapperFiles)[number]) => void
}) {
  const [expanded, setExpanded] = useState(depth < 3)
  const isFolder = !node.file
  const isSelected = node.file && node.file.path === selectedPath

  if (isFolder) {
    const totalSql = node.children.reduce((sum, c) => {
      if (c.file) return sum + c.file.totalSql
      return sum
    }, 0)

    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <span className="text-muted-foreground text-xs w-4">
            {expanded ? "\u25BC" : "\u25B6"}
          </span>
          <span className="text-muted-foreground">
            {"\uD83D\uDCC1"}
          </span>
          <span className="font-medium text-foreground">{node.name}</span>
          {totalSql > 0 && (
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
              {totalSql}
            </Badge>
          )}
        </button>
        {expanded && (
          <div>
            {node.children
              .sort((a, b) => {
                if (!a.file && b.file) return -1
                if (a.file && !b.file) return 1
                return a.name.localeCompare(b.name)
              })
              .map((child) => (
                <TreeItem
                  key={child.path}
                  node={child}
                  depth={depth + 1}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                />
              ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => node.file && onSelect(node.file)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 text-foreground"
      }`}
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <span className="w-4" />
      <span className="text-muted-foreground text-xs">XML</span>
      <span className={isSelected ? "font-medium" : ""}>{node.name}</span>
      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
        {node.file?.totalSql}
      </Badge>
    </button>
  )
}

function generateSampleXml(file: (typeof mapperFiles)[number]): string {
  const namespace = file.path
    .replace("src/main/resources/mapper/", "")
    .replace(".xml", "")
    .replace(/\//g, ".")
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="${namespace}">

  <!-- SELECT statements (${file.selectCount}) -->
  <select id="findById" parameterType="long" resultType="map">
    SELECT * FROM hr.employees
    WHERE employee_id = #{id}
  </select>

  <select id="findByDepartment" parameterType="map" resultType="map">
    SELECT employee_id, first_name, last_name,
           NVL(commission_pct, 0) AS commission
    FROM hr.employees
    WHERE department_id = #{deptId}
    ORDER BY last_name
  </select>

  <!-- INSERT statements (${file.insertCount}) -->
  <insert id="insert" parameterType="map">
    INSERT INTO hr.employees (
      employee_id, first_name, last_name, email,
      department_id, created_date
    ) VALUES (
      seq_employee_id.NEXTVAL, #{firstName}, #{lastName},
      #{email}, #{deptId}, SYSDATE
    )
  </insert>

  <!-- UPDATE statements (${file.updateCount}) -->
  <update id="updateSalary" parameterType="map">
    UPDATE hr.employees
    SET salary = #{newSalary},
        updated_date = SYSDATE
    WHERE employee_id = #{empId}
  </update>

  <!-- DELETE statements (${file.deleteCount}) -->
  <delete id="deleteById" parameterType="long">
    DELETE FROM hr.employees
    WHERE employee_id = #{id}
  </delete>

</mapper>`
}

export default function MapperExplorerPage() {
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree")
  const [selectedFile, setSelectedFile] = useState<(typeof mapperFiles)[number] | null>(null)
  const tree = useMemo(() => buildTree(mapperFiles), [])

  const totalStats = useMemo(() => {
    return mapperFiles.reduce(
      (acc, f) => ({
        select: acc.select + f.selectCount,
        insert: acc.insert + f.insertCount,
        update: acc.update + f.updateCount,
        delete: acc.delete + f.deleteCount,
        total: acc.total + f.totalSql,
      }),
      { select: 0, insert: 0, update: 0, delete: 0, total: 0 }
    )
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mapper Explorer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            MyBatis Mapper 파일 탐색 및 SQL 현황 분석
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "tree" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("tree")}
          >
            트리 뷰
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            테이블 뷰
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "전체 SQL", value: totalStats.total, variant: "default" as const },
          { label: "SELECT", value: totalStats.select, variant: "default" as const },
          { label: "INSERT", value: totalStats.insert, variant: "success" as const },
          { label: "UPDATE", value: totalStats.update, variant: "warning" as const },
          { label: "DELETE", value: totalStats.delete, variant: "destructive" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {viewMode === "tree" ? (
        <div className="flex gap-4" style={{ minHeight: "600px" }}>
          {/* Left Panel - Tree */}
          <Card className="w-[30%] overflow-hidden">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">
                파일 목록 ({mapperFiles.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 overflow-y-auto" style={{ maxHeight: "550px" }}>
              {tree.children.map((child) => (
                <TreeItem
                  key={child.path}
                  node={child}
                  depth={0}
                  selectedPath={selectedFile?.path ?? null}
                  onSelect={setSelectedFile}
                />
              ))}
            </CardContent>
          </Card>

          {/* Right Panel - Detail */}
          <Card className="w-[70%] overflow-hidden">
            {selectedFile ? (
              <>
                <CardHeader className="py-4 px-6 border-b border-border">
                  <CardTitle className="text-lg">{selectedFile.fileName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {selectedFile.path}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge variant="default">SELECT {selectedFile.selectCount}</Badge>
                    <Badge variant="success">INSERT {selectedFile.insertCount}</Badge>
                    <Badge variant="warning">UPDATE {selectedFile.updateCount}</Badge>
                    <Badge variant="destructive">DELETE {selectedFile.deleteCount}</Badge>
                    <Badge variant="secondary" className="ml-2">
                      Total: {selectedFile.totalSql}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CodeEditor
                    value={generateSampleXml(selectedFile)}
                    language="XML (MyBatis Mapper)"
                    readOnly
                    rows={22}
                  />
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  좌측 트리에서 Mapper 파일을 선택하세요
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>파일 경로</TableHead>
                <TableHead className="text-center w-24">SELECT</TableHead>
                <TableHead className="text-center w-24">INSERT</TableHead>
                <TableHead className="text-center w-24">UPDATE</TableHead>
                <TableHead className="text-center w-24">DELETE</TableHead>
                <TableHead className="text-center w-24">합계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mapperFiles.map((file) => (
                <TableRow
                  key={file.path}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedFile(file)
                    setViewMode("tree")
                  }}
                >
                  <TableCell>
                    <div>
                      <span className="font-medium">{file.fileName}</span>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {file.path}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{file.selectCount}</TableCell>
                  <TableCell className="text-center">{file.insertCount}</TableCell>
                  <TableCell className="text-center">{file.updateCount}</TableCell>
                  <TableCell className="text-center">{file.deleteCount}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{file.totalSql}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
