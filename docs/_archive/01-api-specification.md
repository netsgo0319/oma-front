# OMA WebUI v2 — Backend API Specification

> 프론트엔드에서 필요한 전체 API 목록. 현재 모든 데이터는 Mock이며, 백엔드 연동 시 아래 API로 교체해야 합니다.

---

## API Convention

- **Base URL**: `{VITE_API_BASE_URL}` (예: `http://agentcore.internal:8080/api`)
- **Format**: JSON (Content-Type: application/json)
- **인증**: JWT Bearer Token (프로덕션 배포 시 적용)
- **에러 형식**: `{ error: string, detail?: string, status: number }`

---

## 1. Dashboard (4 endpoints)

| Method | Endpoint | 설명 | Response |
|--------|----------|------|----------|
| GET | `/api/dashboard/progress` | 3대 영역 진행률 | `{ dbMigration: {completed, total, percentage}, appMigration: {...}, dataMigration: {...} }` |
| GET | `/api/dashboard/metrics` | 핵심 지표 4종 | `{ dbObjectConversion: {autoConverted, agentConverted, failed}, sqlConversion: {completed, needsRewrite, pending}, testResults: {pass, fail, skip}, dataMigration: {completedTables, totalRows, verified} }` |
| GET | `/api/dashboard/tasks` | 최근 작업 목록 | `Array<{id, name, status, startTime, duration, agent?}>` |
| GET | `/api/dashboard/workflow` | 워크플로우 단계 상태 | `Array<{id, name, description, status, phase, path?}>` |

---

## 2. DB Migration (12 endpoints)

### 2.1 DMS SC Pipeline

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/pipeline/steps` | 6단계 파이프라인 상태 및 로그 조회 |
| POST | `/api/db-migration/pipeline/steps/{index}/run` | 개별 단계 실행 |
| POST | `/api/db-migration/pipeline/run-all` | 전체 단계 일괄 실행 |
| GET | `/api/db-migration/pipeline/steps/{index}/logs` | 단계별 로그 스트림 (SSE) |

### 2.2 Assessment Results

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/assessment` | Assessment 결과 목록 (필터/정렬) |
| GET | `/api/db-migration/assessment/summary` | 요약 통계 (total/converted/agent-needed/failed) |

Query params: `?status=Converted|Failed|Pending&objectType=TABLE|PROCEDURE&schema=HR|SALES`

### 2.3 AI Agent Schema Conversion

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/agent-pipeline` | 에이전트 파이프라인 5단계 상태 |
| GET | `/api/db-migration/schema-conversions` | 변환 객체 목록 (DDL 비교, 점수, 규칙) |
| GET | `/api/db-migration/schema-conversions/{objectName}` | 개별 객체 상세 (원본 DDL, 변환 DDL, remediation 이력) |

### 2.4 Schema Validation

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/schema-validation` | 객체 유형별 Oracle↔PostgreSQL 대조 결과 |

### 2.5 Conversion Context

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/db-migration/conversion-context` | 전체 매핑 데이터 (스키마/패키지/데이터타입/DBLink) |
| PUT | `/api/db-migration/conversion-context/{mappingType}` | 매핑 데이터 수정 (`mappingType`: schema, package, datatype, dblink) |

---

## 3. App Migration (24 endpoints)

### 3.1 Mapper Explorer

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/mapper-files` | Mapper 파일 목록 (경로, SQL 수 통계) |
| GET | `/api/app-migration/mapper-files/{path}` | 개별 Mapper XML 원본 내용 |

### 3.2 SQL Extraction

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/app-migration/extraction/execute` | SQL 추출 실행. Body: `{ mode: "static" | "dynamic" }` |
| GET | `/api/app-migration/extraction/status` | 추출 작업 진행률 |
| GET | `/api/app-migration/extraction/results` | 추출된 SQL 목록 |
| GET | `/api/app-migration/extraction/results/csv` | CSV 다운로드 |

### 3.3 SQL Filtering

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/filtering/results` | 필터링 분류 결과 (변환 필요/신규/불필요) |
| PUT | `/api/app-migration/filtering/results/{sqlId}/category` | 개별 SQL 분류 변경. Body: `{ category: string }` |
| POST | `/api/app-migration/filtering/rules` | 커스텀 필터 규칙 저장 |
| POST | `/api/app-migration/filtering/execute` | 필터링 재실행 |

### 3.4 Query Rewrite (AI Agent)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/app-migration/query-rewrite/execute` | 쿼리 재작성 실행. Body: `{ mode: "sample" | "full" }` |
| GET | `/api/app-migration/query-rewrite/status` | 재작성 진행률 (current/total, success/fail/retry) |
| GET | `/api/app-migration/query-rewrite/results` | 전체 재작성 결과 |
| GET | `/api/app-migration/query-rewrite/results/{sqlId}` | 개별 SQL 상세 (원본, 변환, 테스트, 규칙) |
| GET | `/api/app-migration/query-rewrite/results/{sqlId}/agent-log` | 에이전트 trajectory 로그 |

### 3.5 Manual Review

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/manual-review/pending` | 수동 검수 필요 SQL 목록 |
| PUT | `/api/app-migration/manual-review/{sqlId}` | 수정된 SQL 저장. Body: `{ sql: string }` |
| POST | `/api/app-migration/manual-review/{sqlId}/syntax-check` | PostgreSQL 구문 검증 |
| POST | `/api/app-migration/manual-review/{sqlId}/execute-compare` | Oracle↔PostgreSQL 양쪽 실행 비교 |

### 3.6 XML Merge

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/app-migration/xml-merge/execute` | XML 병합 실행 |
| GET | `/api/app-migration/xml-merge/results` | 병합 결과 목록 |
| GET | `/api/app-migration/xml-merge/results/{fileName}/diff` | 원본 vs 병합 diff |
| GET | `/api/app-migration/xml-merge/results/{fileName}/download` | 병합 파일 다운로드 |

### 3.7 Test Support

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/app-migration/test-errors` | 테스트 에러 목록 |
| GET | `/api/app-migration/test-errors/auto-fixes` | 자동 수정 제안 목록 |
| POST | `/api/app-migration/test-errors/{errorId}/approve` | 자동 수정 승인 |
| POST | `/api/app-migration/test-errors/{errorId}/reject` | 자동 수정 반려 |

---

## 4. Data Migration (7 endpoints)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/data-migration/tables` | 이관 대상 테이블 목록 (상태, 진행률, 행 수) |
| POST | `/api/data-migration/execute` | 데이터 이관 시작 |
| POST | `/api/data-migration/stop` | 이관 중지 |
| POST | `/api/data-migration/tables/{tableName}/retry` | 실패 테이블 재시도 |
| GET | `/api/data-migration/validation` | 전체 검증 결과 (행 수 비교, 샘플 체크) |
| POST | `/api/data-migration/validation/execute` | 검증 실행 |
| GET | `/api/data-migration/validation/{tableName}` | 개별 테이블 상세 검증 |

---

## 5. Tools (14 endpoints)

### 5.1 SQL Executor

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/tools/sql/execute` | SQL 실행. Body: `{ sql, dbMode: "oracle"|"postgresql", bindVariables? }` |
| POST | `/api/tools/sql/explain` | 실행 계획 조회 |
| POST | `/api/tools/sql/compare` | 양쪽 DB 동시 실행 비교 |
| GET | `/api/tools/sql/samples` | 샘플 쿼리 목록 |

Response: `{ columns: string[], rows: Record<string,any>[], rowCount: number, executionTime: number }`

### 5.2 Log Viewer

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tools/logs` | 과거 로그 조회 (레벨/검색 필터) |
| GET | `/api/tools/logs/stream` | 실시간 로그 스트림 (SSE) |

### 5.3 Agent Log Viewer

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tools/agent-logs` | 에이전트 trajectory 로그 |
| GET | `/api/tools/agent-logs?agent={name}` | 에이전트별 필터 |

### 5.4 Conversion Report

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/tools/report/generate` | 보고서 생성 |
| GET | `/api/tools/report/status` | 생성 상태 조회 |
| GET | `/api/tools/report` | 보고서 조회 (JSON) |
| GET | `/api/tools/report/download` | 보고서 다운로드 (HTML/PDF) |

### 5.5 Knowledge Base

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tools/knowledge-base/patterns` | 변환 패턴 검색 |
| POST | `/api/tools/knowledge-base/patterns` | 커스텀 규칙 추가 |

---

## 6. Settings (8 endpoints)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/settings/project` | 프로젝트 설정 조회 |
| PUT | `/api/settings/project` | 프로젝트 설정 저장 |
| POST | `/api/settings/project/test-connection/oracle` | Oracle 접속 테스트 |
| POST | `/api/settings/project/test-connection/postgresql` | PostgreSQL 접속 테스트 |
| GET | `/api/settings/agent` | 에이전트 설정 조회 |
| PUT | `/api/settings/agent` | 에이전트 설정 저장 |
| GET | `/api/settings/test` | 테스트 설정 조회 |
| PUT | `/api/settings/test` | 테스트 설정 저장 |

---

## 7. Real-time Streaming (SSE / WebSocket)

| 기능 | 페이지 | 방식 | 설명 |
|------|--------|------|------|
| 작업 상태 | Dashboard | Polling 10s | 실행 중 작업 상태 갱신 |
| DMS 파이프라인 로그 | DB Migration > DMS 실행 | SSE | 단계별 로그 실시간 스트림 |
| 에이전트 파이프라인 | DB Migration > AI 변환 | SSE / Polling 5s | 에이전트 단계 상태 갱신 |
| SQL 추출 진행률 | App Migration > SQL 추출 | SSE | 진행률 % 스트림 |
| 쿼리 재작성 진행 | App Migration > 쿼리 재작성 | WebSocket | 개별 SQL 변환 상태 스트림 |
| 데이터 이관 진행 | Data Migration > 실행 | WebSocket | 테이블별 진행률 실시간 |
| 시스템 로그 | Tools > 로그 뷰어 | SSE | 연속 로그 스트림 |

---

## 총 요약

| 카테고리 | Endpoint 수 |
|----------|:-----------:|
| Dashboard | 4 |
| DB Migration | 12 |
| App Migration | 24 |
| Data Migration | 7 |
| Tools | 14 |
| Settings | 8 |
| **합계** | **69** |
| Real-time 스트림 | 7 |
