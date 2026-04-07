import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { CodeEditor } from "@/components/CodeEditor"
import { testErrors } from "@/data/app-migration"

export default function TestSupportPage() {
  const [approvalStatus, setApprovalStatus] = useState<Record<string, "approved" | "rejected">>({})

  const stats = useMemo(() => {
    const s = { total: testErrors.length, fixed: 0, pending: 0, approved: 0 }
    for (const err of testErrors) {
      s[err.fixStatus]++
    }
    return s
  }, [])

  const errorTypeVariant = (type: string) => {
    if (type === "SYNTAX_ERROR") return "destructive" as const
    if (type === "TYPE_MISMATCH") return "warning" as const
    if (type === "SEMANTIC_ERROR") return "default" as const
    return "secondary" as const
  }

  const fixStatusVariant = (status: string) => {
    if (status === "fixed") return "success" as const
    if (status === "approved") return "default" as const
    return "warning" as const
  }

  const fixStatusLabel = (status: string) => {
    if (status === "fixed") return "수정됨"
    if (status === "approved") return "승인됨"
    return "대기중"
  }

  const fixedErrors = testErrors.filter((e) => e.fixStatus === "fixed" || e.fixStatus === "approved")

  const originalSqlMap: Record<string, string> = {
    "sql-006": "SELECT * FROM hr.attendance\nWHERE attendance_date = TRUNC(SYSDATE)\nAND employee_id = #{empId}",
    "sql-009": "SELECT * FROM (\n  SELECT product_id, SUM(quantity) AS total_qty,\n    ROWNUM AS rn\n  FROM sales.order_items\n  GROUP BY product_id\n  ORDER BY total_qty DESC\n) WHERE ROWNUM <= 10",
    "sql-025": "SELECT category_id,\n  WM_CONCAT(product_name) AS product_list\nFROM sales.products\nGROUP BY category_id",
    "sql-027": "WITH monthly_sales AS (\n  SELECT TO_CHAR(o.order_date, 'YYYY-MM') AS month,\n    c.region, SUM(o.total_amount) AS total\n  FROM sales.orders o\n  JOIN sales.customers c ON o.customer_id = c.customer_id\n  WHERE o.order_date >= ADD_MONTHS(SYSDATE, -12)\n  GROUP BY TO_CHAR(o.order_date, 'YYYY-MM'), c.region\n)\nSELECT month, region, total,\n  RANK() OVER (PARTITION BY month ORDER BY total DESC) AS rank\nFROM monthly_sales",
    "sql-041": "SELECT customer_id, order_date, total_amount,\n  SUM(total_amount) OVER (\n    PARTITION BY customer_id ORDER BY order_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total,\n  LAG(total_amount) OVER (\n    PARTITION BY customer_id ORDER BY order_date\n  ) AS prev_amount\nFROM sales.orders\nWHERE order_date >= ADD_MONTHS(SYSDATE, -3)",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">테스트 지원</h2>
        <p className="text-sm text-muted-foreground mt-1">
          변환 후 테스트 가이드, 에러 분석 및 자동 수정 관리
        </p>
      </div>

      <Tabs defaultValue="guide">
        <TabsList>
          <TabsTrigger value="guide">테스트 가이드</TabsTrigger>
          <TabsTrigger value="errors">에러 로그</TabsTrigger>
          <TabsTrigger value="autofix">자동 수정</TabsTrigger>
        </TabsList>

        {/* Test Guide Tab */}
        <TabsContent value="guide">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spring AOP 기반 SQL 에러 로깅 설정 가이드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-2">1. 개요</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Oracle에서 PostgreSQL로 마이그레이션 후, 변환된 SQL의 런타임 에러를 체계적으로 수집하기 위해
                    Spring AOP(Aspect-Oriented Programming)를 활용합니다. MyBatis Mapper 실행 시점에
                    자동으로 에러를 캡처하여 분석 데이터를 축적합니다.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-2">2. 의존성 추가</h3>
                  <CodeEditor
                    value={`<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>`}
                    language="XML (Maven)"
                    readOnly
                    rows={5}
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-2">3. AOP Aspect 구현</h3>
                  <CodeEditor
                    value={`@Aspect
@Component
@Slf4j
public class SqlErrorLoggingAspect {

    @Autowired
    private SqlErrorRepository errorRepository;

    @Around("execution(* com.example..mapper..*(..))")
    public Object logSqlError(ProceedingJoinPoint joinPoint) throws Throwable {
        String mapperName = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String sqlId = mapperName + "." + methodName;

        try {
            return joinPoint.proceed();
        } catch (Exception e) {
            SqlErrorLog errorLog = SqlErrorLog.builder()
                .sqlId(sqlId)
                .errorType(classifyError(e))
                .errorMessage(e.getMessage())
                .mapperFile(mapperName + ".xml")
                .occurredAt(LocalDateTime.now())
                .build();

            errorRepository.save(errorLog);
            log.error("[SQL Error] {} - {}: {}", sqlId, errorLog.getErrorType(), e.getMessage());
            throw e;
        }
    }

    private String classifyError(Exception e) {
        String msg = e.getMessage();
        if (msg.contains("syntax error")) return "SYNTAX_ERROR";
        if (msg.contains("does not exist")) return "FUNCTION_NOT_FOUND";
        if (msg.contains("operator does not exist")) return "TYPE_MISMATCH";
        return "SEMANTIC_ERROR";
    }
}`}
                    language="Java (Spring AOP)"
                    readOnly
                    rows={28}
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-2">4. 에러 로그 엔티티</h3>
                  <CodeEditor
                    value={`@Entity
@Table(name = "sql_error_logs")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SqlErrorLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sqlId;
    private String errorType;

    @Column(length = 4000)
    private String errorMessage;

    private String mapperFile;
    private String fixStatus;  // pending, fixed, approved

    @Column(length = 4000)
    private String fixedSql;

    private LocalDateTime occurredAt;
    private LocalDateTime fixedAt;
}`}
                    language="Java (Entity)"
                    readOnly
                    rows={18}
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold mb-2">5. 테스트 실행 방법</h3>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm">
                      <strong>Step 1:</strong> 위 AOP 설정을 프로젝트에 적용합니다.
                    </p>
                    <p className="text-sm">
                      <strong>Step 2:</strong> 기존 통합 테스트 또는 기능 테스트를 실행합니다.
                    </p>
                    <p className="text-sm">
                      <strong>Step 3:</strong> <code className="bg-muted px-1 rounded text-xs">sql_error_logs</code> 테이블에서 에러를 확인합니다.
                    </p>
                    <p className="text-sm">
                      <strong>Step 4:</strong> 에러 로그 탭에서 수집된 에러를 분석하고 자동 수정을 적용합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Error Log Tab */}
        <TabsContent value="errors">
          <div className="space-y-4">
            {/* Error Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">전체 에러</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">수정됨</p>
                  <p className="text-3xl font-bold mt-1 text-emerald-600">{stats.fixed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">승인됨</p>
                  <p className="text-3xl font-bold mt-1 text-blue-600">{stats.approved}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">대기중</p>
                  <p className="text-3xl font-bold mt-1 text-orange-500">{stats.pending}</p>
                </CardContent>
              </Card>
            </div>

            {/* Error Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">SQL ID</TableHead>
                    <TableHead className="w-36">Error Type</TableHead>
                    <TableHead>Error Message</TableHead>
                    <TableHead className="w-44">Mapper File</TableHead>
                    <TableHead className="w-28 text-center">Fix Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testErrors.map((err) => (
                    <TableRow key={err.id}>
                      <TableCell className="font-mono text-xs">{err.sqlId}</TableCell>
                      <TableCell>
                        <Badge variant={errorTypeVariant(err.errorType)}>
                          {err.errorType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-md truncate">
                          {err.errorMessage}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{err.mapperFile}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={fixStatusVariant(err.fixStatus)}>
                          {fixStatusLabel(err.fixStatus)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        {/* Auto-Fix Tab */}
        <TabsContent value="autofix">
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3 px-6">
                <CardTitle className="text-base">
                  자동 수정 목록 ({fixedErrors.length}건)
                </CardTitle>
              </CardHeader>
            </Card>

            {fixedErrors.map((err) => (
              <Card key={err.id} className="overflow-hidden">
                <CardHeader className="py-3 px-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{err.sqlId}</span>
                    <Badge variant={errorTypeVariant(err.errorType)}>{err.errorType}</Badge>
                    <Badge variant={fixStatusVariant(err.fixStatus)}>
                      {fixStatusLabel(err.fixStatus)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{err.mapperFile}</span>
                    <div className="flex-1" />
                    {approvalStatus[err.id] ? (
                      <Badge
                        variant={approvalStatus[err.id] === "approved" ? "success" : "destructive"}
                      >
                        {approvalStatus[err.id] === "approved" ? "승인 완료" : "거부됨"}
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            setApprovalStatus((prev) => ({ ...prev, [err.id]: "approved" }))
                          }
                        >
                          승인
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setApprovalStatus((prev) => ({ ...prev, [err.id]: "rejected" }))
                          }
                        >
                          거부
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
                    {err.errorMessage}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Original SQL (에러 발생)</p>
                      <div className="rounded-lg border border-border bg-destructive/5 p-3">
                        <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                          {originalSqlMap[err.sqlId] || `-- Original SQL for ${err.sqlId}`}
                        </pre>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Fixed SQL (자동 수정)</p>
                      <div className="rounded-lg border border-border bg-emerald-500/5 p-3">
                        <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                          {err.fixedSql || "-- Fix pending --"}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
