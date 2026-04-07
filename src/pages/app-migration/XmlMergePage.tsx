import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { DiffViewer } from "@/components/DiffViewer"
import { xmlMergeResults } from "@/data/app-migration"

function generateOriginalXml(fileName: string): string {
  const baseName = fileName.replace(".xml", "")
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.${baseName}">

  <select id="findAll" resultType="map">
    SELECT id, name, NVL(description, 'N/A') AS description,
           TO_CHAR(created_date, 'YYYY-MM-DD') AS created_date
    FROM main_table
    WHERE status = 'ACTIVE'
    AND ROWNUM <= 100
    ORDER BY name
  </select>

  <select id="findById" parameterType="long" resultType="map">
    SELECT id, name, NVL(email, '') AS email,
           DECODE(status, 'A', 'Active', 'I', 'Inactive', 'Unknown') AS status_name
    FROM main_table
    WHERE id = #{id}
  </select>

  <insert id="insert" parameterType="map">
    INSERT INTO main_table (id, name, email, status, created_date)
    VALUES (seq_main_id.NEXTVAL, #{name}, #{email}, #{status}, SYSDATE)
  </insert>

  <update id="update" parameterType="map">
    UPDATE main_table
    SET name = #{name}, email = #{email},
        updated_date = SYSDATE
    WHERE id = #{id}
  </update>

</mapper>`
}

function generateMergedXml(fileName: string): string {
  const baseName = fileName.replace(".xml", "")
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.${baseName}">

  <select id="findAll" resultType="map">
    SELECT id, name, COALESCE(description, 'N/A') AS description,
           TO_CHAR(created_date, 'YYYY-MM-DD') AS created_date
    FROM main_table
    WHERE status = 'ACTIVE'
    ORDER BY name
    LIMIT 100
  </select>

  <select id="findById" parameterType="long" resultType="map">
    SELECT id, name, COALESCE(email, '') AS email,
           CASE status WHEN 'A' THEN 'Active' WHEN 'I' THEN 'Inactive' ELSE 'Unknown' END AS status_name
    FROM main_table
    WHERE id = #{id}
  </select>

  <insert id="insert" parameterType="map">
    INSERT INTO main_table (id, name, email, status, created_date)
    VALUES (nextval('seq_main_id'), #{name}, #{email}, #{status}, CURRENT_TIMESTAMP)
  </insert>

  <update id="update" parameterType="map">
    UPDATE main_table
    SET name = #{name}, email = #{email},
        updated_date = CURRENT_TIMESTAMP
    WHERE id = #{id}
  </update>

</mapper>`
}

export default function XmlMergePage() {
  const [isMerging, setIsMerging] = useState(false)
  const [merged, setMerged] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const handleMerge = () => {
    setIsMerging(true)
    setTimeout(() => {
      setIsMerging(false)
      setMerged(true)
    }, 1500)
  }

  const handleDownload = (fileName: string) => {
    const content = generateMergedXml(fileName)
    const blob = new Blob([content], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalChanges = xmlMergeResults.reduce((sum, r) => sum + r.changes, 0)
  const passCount = xmlMergeResults.filter((r) => r.validationStatus === "pass").length
  const warningCount = xmlMergeResults.filter((r) => r.validationStatus === "warning").length
  const javaChangesCount = xmlMergeResults.filter((r) => r.hasJavaChanges).length

  const selectedResult = selectedFile
    ? xmlMergeResults.find((r) => r.fileName === selectedFile)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">XML 병합</h2>
          <p className="text-sm text-muted-foreground mt-1">
            변환된 SQL을 원본 Mapper XML에 병합합니다
          </p>
        </div>
        <Button onClick={handleMerge} disabled={isMerging}>
          {isMerging ? "병합 중..." : "병합 실행"}
        </Button>
      </div>

      {/* Summary Stats */}
      {merged && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">전체 파일</p>
              <p className="text-3xl font-bold mt-1">{xmlMergeResults.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">총 변경 사항</p>
              <p className="text-3xl font-bold mt-1">{totalChanges}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">검증 상태</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="success">Pass {passCount}</Badge>
                <Badge variant="warning">Warning {warningCount}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Java 변경 필요</p>
              <p className="text-3xl font-bold mt-1 text-orange-500">{javaChangesCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {merged && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="text-center w-28">Original Lines</TableHead>
                <TableHead className="text-center w-28">Merged Lines</TableHead>
                <TableHead className="text-center w-24">Changes</TableHead>
                <TableHead className="text-center w-28">Validation</TableHead>
                <TableHead className="text-center w-28">Java Changes</TableHead>
                <TableHead className="text-center w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {xmlMergeResults.map((result) => (
                <TableRow
                  key={result.fileName}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedFile(
                      selectedFile === result.fileName ? null : result.fileName
                    )
                  }
                >
                  <TableCell>
                    <span className="font-medium">{result.fileName}</span>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {result.originalLines}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {result.mergedLines}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{result.changes}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={result.validationStatus === "pass" ? "success" : "warning"}
                    >
                      {result.validationStatus === "pass" ? "Pass" : "Warning"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {result.hasJavaChanges ? (
                      <Badge variant="warning">필요</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(result.fileName)
                      }}
                    >
                      다운로드
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Diff Viewer for Selected File */}
      {selectedFile && selectedResult && (
        <Card>
          <CardHeader className="py-3 px-6 border-b border-border">
            <CardTitle className="text-base">
              {selectedResult.fileName} - Diff 비교
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DiffViewer
              original={generateOriginalXml(selectedResult.fileName)}
              modified={generateMergedXml(selectedResult.fileName)}
              language="XML (MyBatis Mapper)"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
