# OMA 프론트엔드 API 요구사항

> 프론트엔드가 **필요로 하는** 백엔드 API 목록.
> 백엔드가 현재 무엇을 할 수 있는지는 [01-backend-analysis.md](./01-backend-analysis.md) 참조.

---

## API Convention

- **Base URL**: `{VITE_API_BASE_URL}` (예: `http://localhost:8000/api`)
- **Format**: JSON (Content-Type: application/json)
- **인증**: JWT Bearer Token (프로덕션 배포 시)
- **에러 형식**: `{ error: string, detail?: string, status: number }`
- **프로젝트 스코프**: 모든 API는 프로젝트 컨텍스트 내에서 동작 (헤더 `X-Project-Id` 또는 경로 prefix `/api/projects/{projectId}/...`)

---

## 1. 프로젝트 관리 API (신규)

> 현재 프론트엔드는 `localStorage`에 프로젝트를 저장 (`src/contexts/ProjectContext.tsx`).
> 서버 저장소로 전환 필요.

### 1.0 테이블 카탈로그 (프로젝트 생성 시 스코프 선택용)

| Method | Endpoint | 설명 | 요청/응답 |
|--------|----------|------|----------|
| GET | `/api/catalog/schemas` | Oracle 소스 DB 스키마 목록 | → `{ schemas: [{ name, tableCount, totalRows, totalSizeMb }] }` |
| GET | `/api/catalog/schemas/{schema}/tables` | 스키마 내 테이블 목록 | → `{ tables: [{ schema, tableName, fullName, rowCount, sizeMb, hasLob, hasTrigger }] }` |
| GET | `/api/catalog/tables` | 전체 테이블 목록 | → `{ tables: CatalogTable[] }` |

> 프로젝트 생성 Step 2 및 프로젝트 설정 > 마이그레이션 범위 수정에서 사용. 현재 프론트엔드는 `src/data/table-catalog.ts` 목데이터 사용 중.

### 1.1 프로젝트 CRUD

| Method | Endpoint | 설명 | 요청/응답 |
|--------|----------|------|----------|
| GET | `/api/projects` | 프로젝트 목록 | → `Project[]` |
| POST | `/api/projects` | 프로젝트 생성 | `{ name, featurePreset, migrationScope }` → `Project` |
| GET | `/api/projects/{id}` | 프로젝트 상세 | → `Project` |
| PUT | `/api/projects/{id}` | 프로젝트 수정 (이름, 상태, 범위) | `{ name?, status?, migrationScope? }` → `Project` |
| DELETE | `/api/projects/{id}` | 프로젝트 삭제 | → `204` |
| POST | `/api/projects/{id}/duplicate` | 프로젝트 복제 | → `Project` |

`Project` 타입 (`src/types/project.ts`):

```typescript
interface Project {
  id: string;
  name: string;
  status: 'active' | 'archived' | 'paused';
  createdAt: string;
  updatedAt: string;
  featurePreset: 'basic' | 'standard' | 'advanced';
  featureFlags: FeatureFlags;   // 23개 boolean 플래그
  migrationScope: MigrationScope; // 마이그레이션 대상 범위
  settings: {
    project: ProjectSettings;   // DB 접속정보, DMS 설정
    agent: AgentSettings;       // 모델 ID, 재시도 횟수
    test: TestSettings;         // 바인드 변수, 데이터소스
  };
  migrationProgress: MigrationProgress;

// 마이그레이션 범위 (테이블 스코프)
interface MigrationScope {
  mode: 'all' | 'schema' | 'table';  // 전체 / 스키마 단위 / 테이블 직접 선택
  selectedSchemas: string[];           // 스키마 단위 선택 시 ['HR', 'SALES']
  selectedTables: string[];            // 테이블 직접 선택 시 ['HR.EMPLOYEES', ...]
  description: string;                 // 사용자 표시용 요약
}
}
```

### 1.2 프로젝트별 설정

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/{id}/settings/project` | 프로젝트 설정 조회 (DB 접속정보, DMS 등) |
| PUT | `/api/projects/{id}/settings/project` | 프로젝트 설정 저장 |
| POST | `/api/projects/{id}/settings/test-connection/oracle` | Oracle 접속 테스트 |
| POST | `/api/projects/{id}/settings/test-connection/postgresql` | PostgreSQL 접속 테스트 |
| GET | `/api/projects/{id}/settings/agent` | 에이전트 설정 조회 |
| PUT | `/api/projects/{id}/settings/agent` | 에이전트 설정 저장 |
| GET | `/api/projects/{id}/settings/test` | 테스트 설정 조회 |
| PUT | `/api/projects/{id}/settings/test` | 테스트 설정 저장 |

---

## 2. 기능 토글 API (신규)

> 현재 프론트엔드는 프로젝트 객체 내 `featureFlags`를 직접 조작 (`src/data/feature-definitions.ts`).
> 서버 저장/로드 필요.

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/{id}/features` | 현재 기능 플래그 조회 → `FeatureFlags` |
| PUT | `/api/projects/{id}/features` | 기능 플래그 일괄 업데이트 → `{ flags: Partial<FeatureFlags> }` |
| PUT | `/api/projects/{id}/features/preset` | 프리셋 적용 → `{ preset: 'basic' | 'standard' | 'advanced' }` |
| GET | `/api/features/definitions` | 기능 정의 목록 (라벨, 카테고리, isCore 등) |
| GET | `/api/features/presets` | 프리셋별 기본 플래그 조회 |

기능 플래그 (23개):

```typescript
type FeatureFlags = Record<FeatureKey, boolean>;
// FeatureKey: 'dashboard' | 'dmsExecution' | 'dmsResults' | 'aiSchema' | ...
```

---

## 3. Dashboard API (4 endpoints)

> 페이지: `src/pages/dashboard/DashboardPage.tsx`
> Mock: `src/data/dashboard.ts`

| Method | Endpoint | 설명 | 응답 예시 |
|--------|----------|------|----------|
| GET | `/api/dashboard/progress` | 3대 영역 진행률 | `{ dbMigration: {completed, total, percentage}, appMigration: {...}, dataMigration: {...} }` |
| GET | `/api/dashboard/metrics` | 핵심 지표 4종 | `{ dbObjectConversion: {autoConverted, agentConverted, failed}, sqlConversion: {...}, testResults: {...}, dataMigration: {...} }` |
| GET | `/api/dashboard/tasks` | 최근 작업 목록 | `Array<{id, name, status, startTime, duration, agent?}>` |
| GET | `/api/dashboard/workflow` | 워크플로우 단계 상태 | `Array<{id, name, description, status, phase, path?}>` |

**실시간**: 대시보드 작업 상태는 Polling 10s 또는 SSE.

---

## 4. DB Migration API (12 endpoints)

### 4.1 DMS SC 파이프라인

> 페이지: `src/pages/db-migration/DmsExecutionPage.tsx`
> Mock: `src/data/db-migration.ts` → `dmsPipelineSteps`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/pipeline/steps` | 6단계 파이프라인 상태 및 로그 |
| POST | `/api/db-migration/pipeline/steps/{index}/run` | 개별 단계 실행 |
| POST | `/api/db-migration/pipeline/run-all` | 전체 단계 일괄 실행 |
| GET | `/api/db-migration/pipeline/steps/{index}/logs` | 단계별 로그 스트림 (**SSE**) |

파이프라인 6단계: Pre-Assessment → Schema Conversion → Agent Remediation → Schema Validation → DMS Replication Setup → Full Load & CDC

단계 응답 형식:

```json
{
  "name": "Schema Conversion",
  "description": "Oracle DDL → PostgreSQL DDL 자동 변환",
  "category": "schema-conversion",
  "provenance": "aws-dms",
  "status": "completed",
  "duration": "28m 17s",
  "logs": ["[INFO] Starting schema conversion...", "..."]
}
```

### 4.2 Assessment 결과

> 페이지: `src/pages/db-migration/DmsResultsPage.tsx`
> Mock: `src/data/db-migration.ts` → `assessmentResults`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/assessment` | Assessment 결과 목록 (필터/정렬) |
| GET | `/api/db-migration/assessment/summary` | 요약 통계 |

Query params: `?status=Converted|Failed|Pending&objectType=TABLE|PROCEDURE&schema=HR|SALES`

결과 항목:

```json
{
  "objectName": "PKG_FIN.FN_CALC_TAX",
  "objectType": "FUNCTION",
  "schema": "FIN",
  "complexity": "Complex",
  "status": "Failed",
  "failureReason": "DBMS_SQL dynamic cursor not supported"
}
```

### 4.3 AI 에이전트 스키마 변환

> 페이지: `src/pages/db-migration/AiSchemaPage.tsx`
> Mock: `src/data/db-migration.ts` → `agentPipeline`, `schemaConversions`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/agent-pipeline` | 에이전트 파이프라인 5단계 상태 |
| GET | `/api/db-migration/schema-conversions` | 변환 객체 목록 (DDL 비교, 점수, 규칙) |
| GET | `/api/db-migration/schema-conversions/{objectName}` | 개별 객체 상세 (원본/변환 DDL, remediation 이력) |

**실시간**: SSE / Polling 5s로 에이전트 단계 상태 갱신.

변환 객체 응답:

```json
{
  "objectName": "PKG_ORDER_MGMT.PROC_CALC_TOTAL",
  "objectType": "PROCEDURE",
  "oracleDDL": "CREATE OR REPLACE PROCEDURE ...",
  "postgresqlDDL": "CREATE OR REPLACE FUNCTION ...",
  "score": 95,
  "rules": ["OUT param→RETURNS", "NVL→COALESCE", "SYSDATE→CURRENT_TIMESTAMP"],
  "remediationHistory": [
    { "attempt": 1, "changes": "Initial SCT conversion", "score": 72 },
    { "attempt": 2, "changes": "Agent fixed exception handling", "score": 95 }
  ]
}
```

### 4.4 스키마 검증

> 페이지: `src/pages/db-migration/SchemaValidationPage.tsx`
> Mock: `src/data/db-migration.ts` → `schemaValidation`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/schema-validation` | 객체 유형별 Oracle↔PostgreSQL 대조 결과 |

응답:

```json
[
  { "objectType": "Tables", "oracleCount": 168, "postgresCount": 168, "matched": 168, "mismatched": 0, "missing": 0 },
  { "objectType": "Procedures", "oracleCount": 47, "postgresCount": 44, "matched": 42, "mismatched": 2, "missing": 3 }
]
```

### 4.5 변환 컨텍스트

> 페이지: `src/pages/db-migration/ConversionContextPage.tsx`
> Mock: `src/data/db-migration.ts` → `conversionContext`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/conversion-context` | 전체 매핑 데이터 |
| PUT | `/api/db-migration/conversion-context/{mappingType}` | 매핑 수정 |

`mappingType`: `schema` | `package` | `datatype` | `dblink`

매핑 데이터 예시:

```json
{
  "schemaMapping": [{ "oracle": "HR", "postgresql": "hr" }],
  "packageMapping": [{ "oraclePackage": "PKG_ORDER_MGMT", "postgresSchema": "sales", "functions": ["calc_total", "apply_discount"] }],
  "dataTypeMapping": [{ "oracle": "NUMBER(p,s)", "postgresql": "NUMERIC(p,s)" }],
  "dbLinkMapping": [{ "original": "DBLINK_LEGACY_SYSTEM", "replacement": "postgres_fdw → legacy_server" }]
}
```

---

## 5. App Migration API (24 endpoints)

### 5.1 Mapper 파일 탐색

> 페이지: `src/pages/app-migration/MapperExplorerPage.tsx`
> Mock: `src/data/app-migration.ts` → `mapperFiles`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/mapper-files` | Mapper 파일 목록 (경로, SQL 수 통계) |
| GET | `/api/app-migration/mapper-files/{path}` | 개별 Mapper XML 원본 내용 |

응답:

```json
[{
  "path": "src/main/resources/mapper/com/example/hr/EmployeeMapper.xml",
  "fileName": "EmployeeMapper.xml",
  "selectCount": 12, "insertCount": 3, "updateCount": 5, "deleteCount": 2,
  "totalSql": 22
}]
```

### 5.2 SQL 추출

> 페이지: `src/pages/app-migration/SqlExtractionPage.tsx`
> Mock: `src/data/app-migration.ts` → `extractedSqls`

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/app-migration/extraction/execute` | SQL 추출 실행. `{ mode: "static" | "dynamic" }` |
| GET | `/api/app-migration/extraction/status` | 추출 진행률 (**SSE**) |
| GET | `/api/app-migration/extraction/results` | 추출된 SQL 목록 |
| GET | `/api/app-migration/extraction/results/csv` | CSV 다운로드 |

SQL 항목:

```json
{
  "id": "sql-001",
  "mapperId": "EmployeeMapper",
  "sqlType": "SELECT",
  "originalSql": "SELECT ... NVL(commission_pct, 0) ...",
  "hasDynamicTags": false,
  "complexity": "Low",
  "oracleSpecific": true
}
```

### 5.3 SQL 필터링

> 페이지: `src/pages/app-migration/SqlFilteringPage.tsx`
> Mock: `src/data/app-migration.ts` → `filterResults`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/filtering/results` | 분류 결과 (needsConversion / noConversionNeeded / newQuery) |
| PUT | `/api/app-migration/filtering/results/{sqlId}/category` | 분류 변경. `{ category: string }` |
| POST | `/api/app-migration/filtering/rules` | 커스텀 필터 규칙 저장 |
| POST | `/api/app-migration/filtering/execute` | 필터링 재실행 |

### 5.4 쿼리 재작성 (AI Agent)

> 페이지: `src/pages/app-migration/QueryRewritePage.tsx`
> Mock: `src/data/app-migration.ts` → `queryRewriteResults`

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/app-migration/query-rewrite/execute` | 변환 실행. `{ mode: "sample" | "full" }` |
| GET | `/api/app-migration/query-rewrite/status` | 진행률 (`current/total, success/fail/retry`) |
| GET | `/api/app-migration/query-rewrite/results` | 전체 결과 |
| GET | `/api/app-migration/query-rewrite/results/{sqlId}` | 개별 SQL 상세 (원본, 변환, 테스트, 규칙) |
| GET | `/api/app-migration/query-rewrite/results/{sqlId}/agent-log` | 에이전트 trajectory 로그 |

**실시간**: WebSocket으로 개별 SQL 변환 완료 시마다 이벤트 전송 (쿼리당 30-60초).

결과 항목:

```json
{
  "sqlId": "sql-012",
  "originalSql": "SELECT ... CONNECT BY PRIOR ...",
  "convertedSql": "WITH RECURSIVE dept_tree AS (...)",
  "status": "pass",
  "testResult": { "executed": true, "rowCount": 27, "matchesOriginal": true },
  "retryCount": 2,
  "rules": ["CONNECT BY→WITH RECURSIVE", "SYS_CONNECT_BY_PATH→string concatenation"],
  "agentLog": "Attempt 1: Missing UNION ALL anchor..."
}
```

### 5.5 수동 검수

> 페이지: `src/pages/app-migration/ManualReviewPage.tsx`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/manual-review/pending` | 수동 검수 필요 SQL 목록 |
| PUT | `/api/app-migration/manual-review/{sqlId}` | 수정된 SQL 저장. `{ sql: string }` |
| POST | `/api/app-migration/manual-review/{sqlId}/syntax-check` | PostgreSQL 구문 검증 |
| POST | `/api/app-migration/manual-review/{sqlId}/execute-compare` | Oracle↔PostgreSQL 양쪽 실행 비교 |

### 5.6 XML 병합

> 페이지: `src/pages/app-migration/XmlMergePage.tsx`
> Mock: `src/data/app-migration.ts` → `xmlMergeResults`

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/app-migration/xml-merge/execute` | XML 병합 실행 |
| GET | `/api/app-migration/xml-merge/results` | 병합 결과 목록 |
| GET | `/api/app-migration/xml-merge/results/{fileName}/diff` | 원본 vs 병합 diff |
| GET | `/api/app-migration/xml-merge/results/{fileName}/download` | 병합 파일 다운로드 |

결과:

```json
{
  "fileName": "EmployeeMapper.xml",
  "originalLines": 245,
  "mergedLines": 248,
  "changes": 8,
  "validationStatus": "pass",
  "hasJavaChanges": false
}
```

### 5.7 테스트 지원

> 페이지: `src/pages/app-migration/TestSupportPage.tsx`
> Mock: `src/data/app-migration.ts` → `testErrors`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/test-errors` | 테스트 에러 목록 |
| GET | `/api/app-migration/test-errors/auto-fixes` | 자동 수정 제안 목록 |
| POST | `/api/app-migration/test-errors/{errorId}/approve` | 자동 수정 승인 |
| POST | `/api/app-migration/test-errors/{errorId}/reject` | 자동 수정 반려 |

에러 항목:

```json
{
  "id": "err-001",
  "sqlId": "sql-006",
  "errorType": "TYPE_MISMATCH",
  "errorMessage": "operator does not exist: timestamp without time zone = date",
  "mapperFile": "AttendanceMapper.xml",
  "fixStatus": "fixed",
  "fixedSql": "SELECT * FROM hr.attendance WHERE attendance_date::DATE = CURRENT_DATE AND ..."
}
```

---

## 6. Data Migration API (7 endpoints)

> 페이지: `src/pages/data-migration/DataExecutionPage.tsx`, `DataValidationPage.tsx`
> Mock: `src/data/data-migration.ts`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/data-migration/tables` | 이관 대상 테이블 목록 (상태, 진행률, 행 수) |
| POST | `/api/data-migration/execute` | 데이터 이관 시작 |
| POST | `/api/data-migration/stop` | 이관 중지 |
| POST | `/api/data-migration/tables/{tableName}/retry` | 실패 테이블 재시도 |
| GET | `/api/data-migration/validation` | 전체 검증 결과 (행 수 비교, 샘플 체크) |
| POST | `/api/data-migration/validation/execute` | 검증 실행 |
| GET | `/api/data-migration/validation/{tableName}` | 개별 테이블 상세 검증 |

**실시간**: WebSocket으로 테이블별 진행률 실시간 갱신.

테이블 항목:

```json
{
  "tableName": "SALES.ORDERS",
  "schema": "SALES",
  "rowCount": 2456789,
  "status": "completed",
  "progress": 100,
  "startTime": "2026-04-06T06:06:19Z",
  "duration": "18m 22s"
}
```

검증 항목:

```json
{
  "tableName": "HR.EMPLOYEES",
  "oracleRowCount": 2341,
  "postgresRowCount": 2341,
  "match": true,
  "sampleCheck": "pass"
}
```

---

## 7. Tools API (14 endpoints)

### 7.1 SQL 실행기

> 페이지: `src/pages/tools/SqlExecutorPage.tsx`
> Mock: `src/data/tools.ts` → `sampleQueries`

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/tools/sql/execute` | SQL 실행. `{ sql, dbMode: "oracle"|"postgresql", bindVariables? }` |
| POST | `/api/tools/sql/explain` | 실행 계획 조회 |
| POST | `/api/tools/sql/compare` | 양쪽 DB 동시 실행 비교 |
| GET | `/api/tools/sql/samples` | 샘플 쿼리 목록 |

응답: `{ columns: string[], rows: Record<string,any>[], rowCount: number, executionTime: number }`

### 7.2 로그 뷰어

> 페이지: `src/pages/tools/LogViewerPage.tsx`
> Mock: `src/data/tools.ts` → `realtimeLogs`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tools/logs` | 과거 로그 조회 (레벨/검색 필터) |
| GET | `/api/tools/logs/stream` | 실시간 로그 스트림 (**SSE**) |

### 7.3 에이전트 로그 뷰어

> 페이지: `src/pages/tools/AgentLogPage.tsx`
> Mock: `src/data/tools.ts` → `agentLogs`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tools/agent-logs` | 에이전트 trajectory 로그 |
| GET | `/api/tools/agent-logs?agent={name}` | 에이전트별 필터 |

에이전트 로그 항목:

```json
{
  "timestamp": "2026-04-06T10:15:12.000Z",
  "agent": "Discovery",
  "action": "Analyzing failed SQL conversion",
  "tool": "sql-parser",
  "input": "sql-012: CONNECT BY hierarchical query",
  "output": "Identified: CONNECT BY PRIOR, SYS_CONNECT_BY_PATH...",
  "thinking": "This is a hierarchical query that requires WITH RECURSIVE..."
}
```

### 7.4 변환 보고서

> 페이지: `src/pages/tools/ConversionReportPage.tsx`
> Mock: `src/data/tools.ts` → `reportSections`

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/tools/report/generate` | 보고서 생성 |
| GET | `/api/tools/report/status` | 생성 상태 조회 |
| GET | `/api/tools/report` | 보고서 조회 (JSON — 섹션별 markdown) |
| GET | `/api/tools/report/download` | 보고서 다운로드 (HTML/PDF) |

### 7.5 지식 베이스

> 페이지: `src/pages/tools/KnowledgeBasePage.tsx`
> Mock: `src/data/tools.ts` → `conversionPatterns`

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tools/knowledge-base/patterns` | 변환 패턴 검색 |
| POST | `/api/tools/knowledge-base/patterns` | 커스텀 규칙 추가 |

패턴 항목:

```json
{
  "id": "pat-008",
  "oraclePattern": "CONNECT BY PRIOR ... START WITH ...",
  "postgresPattern": "WITH RECURSIVE ... UNION ALL ...",
  "category": "Hierarchical",
  "description": "계층형 쿼리",
  "example": "START WITH parent IS NULL CONNECT BY PRIOR id = parent_id → WITH RECURSIVE tree AS (...)"
}
```

---

## 8. 실시간 스트리밍 요구사항 (SSE / WebSocket)

| 기능 | 페이지 | 방식 | 설명 |
|------|--------|------|------|
| 작업 상태 | Dashboard | Polling 10s | 실행 중 작업 상태 갱신 |
| DMS 파이프라인 로그 | DmsExecutionPage | **SSE** | 단계별 로그 실시간 스트림 |
| 에이전트 파이프라인 | AiSchemaPage | SSE / Polling 5s | 에이전트 단계 상태 갱신 |
| SQL 추출 진행률 | SqlExtractionPage | **SSE** | 진행률 % 스트림 |
| 쿼리 재작성 진행 | QueryRewritePage | **WebSocket** | 개별 SQL 변환 상태 스트림 (장시간) |
| 데이터 이관 진행 | DataExecutionPage | **WebSocket** | 테이블별 진행률 실시간 |
| 시스템 로그 | LogViewerPage | **SSE** | 연속 로그 스트림 |

---

## 9. 총 요약

| 카테고리 | Endpoint 수 | 비고 |
|----------|:-----------:|------|
| 프로젝트 관리 (신규) | 6 | CRUD + 복제 |
| 프로젝트 설정 | 8 | 프로젝트별 설정 저장 |
| 기능 토글 (신규) | 5 | 프리셋 + 개별 플래그 |
| Dashboard | 4 | |
| DB Migration | 12 | DMS 파이프라인 + Assessment + AI + 검증 + 컨텍스트 |
| App Migration | 24 | Mapper → 추출 → 필터 → 변환 → 검수 → 병합 → 테스트 |
| Data Migration | 7 | 이관 실행 + 검증 |
| Tools | 14 | SQL 실행기 + 로그 + 보고서 + 지식 베이스 |
| **합계** | **80** | |
| Real-time 스트림 | 7 | SSE 4 + WebSocket 2 + Polling 1 |

### 기존 대비 추가된 API

| 카테고리 | 추가 사유 |
|----------|----------|
| 프로젝트 CRUD (6개) | 프론트엔드에 프로젝트 대시보드 추가로 서버 저장 필요 |
| 프로젝트별 설정 (8개) | 기존 Settings를 프로젝트 스코프로 분리 |
| 기능 토글 (5개) | 프론트엔드에 기능 관리 페이지 추가 (`FeatureManagementPage.tsx`) |
