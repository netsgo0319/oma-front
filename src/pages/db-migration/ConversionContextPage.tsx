import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { conversionContext } from "@/data/db-migration"

function EditableCell({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [val, setVal] = useState(value)
  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      className={`w-full bg-transparent border border-transparent hover:border-border focus:border-primary focus:outline-none rounded px-2 py-1 text-sm font-mono ${className ?? ""}`}
    />
  )
}

export default function ConversionContextPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">변환 컨텍스트 관리</h2>
        <p className="text-muted-foreground mt-1">
          Oracle to PostgreSQL 변환에 사용되는 매핑 정보 관리
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="schema">
            <TabsList>
              <TabsTrigger value="schema">스키마 매핑</TabsTrigger>
              <TabsTrigger value="package">패키지 매핑</TabsTrigger>
              <TabsTrigger value="datatype">데이터타입 매핑</TabsTrigger>
              <TabsTrigger value="dblink">DB Link 매핑</TabsTrigger>
            </TabsList>

            {/* Schema Mapping */}
            <TabsContent value="schema" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Oracle 스키마</TableHead>
                    <TableHead>PostgreSQL 스키마</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversionContext.schemaMapping.map((row, idx) => (
                    <TableRow key={row.oracle}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <EditableCell value={row.oracle} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.postgresql} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Package Mapping */}
            <TabsContent value="package" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Oracle 패키지</TableHead>
                    <TableHead>PostgreSQL 스키마</TableHead>
                    <TableHead>변환된 함수</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversionContext.packageMapping.map((row, idx) => (
                    <TableRow key={row.oraclePackage}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <EditableCell value={row.oraclePackage} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.postgresSchema} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.functions.map((fn) => (
                            <Badge key={fn} variant="secondary" className="font-mono text-xs">
                              {fn}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Data Type Mapping */}
            <TabsContent value="datatype" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Oracle 데이터타입</TableHead>
                    <TableHead>PostgreSQL 데이터타입</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversionContext.dataTypeMapping.map((row, idx) => (
                    <TableRow key={row.oracle}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <EditableCell value={row.oracle} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.postgresql} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* DB Link Mapping */}
            <TabsContent value="dblink" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>원본 DB Link</TableHead>
                    <TableHead>대체 방안</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversionContext.dbLinkMapping.map((row, idx) => (
                    <TableRow key={row.original}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell>
                        <EditableCell value={row.original} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.replacement} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
