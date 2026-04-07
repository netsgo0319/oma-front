# OMA 프론트엔드-백엔드 갭 분석

> Doc 1 ([01-backend-analysis.md](./01-backend-analysis.md))과 Doc 2 ([02-frontend-api-requirements.md](./02-frontend-api-requirements.md))를 비교하여 식별한 갭 목록.
> 각 갭별로 해결 방안, 우선순위, 노력 추정을 포함합니다.

---

## 요약

| 구분 | 프론트엔드 요구 | 백엔드 제공 | 갭 |
|------|:--------------:|:----------:|:---:|
| REST Endpoints | 83개 | 11개 (OMA_Strands_Graph) + 0개 (strands-oracle-migration) | **72개** |
| 실시간 스트림 | SSE 4 + WebSocket 2 + Polling 1 | WebSocket 1 (25 이벤트) | 부분 매칭 |
| 프로젝트 관리 | 서버 저장 필요 (19 endpoints) | 없음 | **신규 필요** |
| 앱 마이그레이션 API | 24 endpoints | CLI만 존재 (HTTP API 없음) | **전체 신규** |

---

## 1. 프로젝트 관리 및 설정 (19 endpoints)

### GAP-00: 테이블 카탈로그 API (프로젝트 스코프 선택)

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/catalog/schemas`, `GET /api/catalog/schemas/{schema}/tables`, `GET /api/catalog/tables` (3 endpoints) — 프로젝트 생성 시 마이그레이션 대상 테이블을 스키마 단위 또는 개별 테이블 단위로 선택 |
| **백엔드 현황** | OMA_Strands_Graph의 `GET /api/discover` 또는 DMS Pre-Assessment에서 스키마/테이블 정보를 수집하지만, 전용 카탈로그 API는 없음 |
| **판단** | **신규 코드 추가 필요** — OMA_Strands_Graph에 `/api/catalog/*` 엔드포인트 3개 추가. Oracle `ALL_TABLES`, `ALL_TAB_COLUMNS` 메타데이터 쿼리 결과를 캐시하여 반환. 현재 프론트는 `src/data/table-catalog.ts` 목데이터 사용 중 |
| **우선순위** | **P0 필수** — 프로젝트를 의미 있게 나누려면 테이블 카탈로그가 있어야 함 |
| **노력** | 백엔드 2일 (Oracle 메타 쿼리 + FastAPI 3 endpoints + 캐시) |

### GAP-01: 프로젝트 CRUD API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET/POST/PUT/DELETE /api/projects`, `POST /api/projects/{id}/duplicate` (6 endpoints) |
| **백엔드 현황** | 없음. 프론트엔드가 `localStorage`로 자체 관리 중 (`src/contexts/ProjectContext.tsx`) |
| **판단** | **Mock 유지 (프론트엔드 localStorage)** — MVP 단계에서는 프로젝트 관리를 프론트엔드 localStorage로 유지. 멀티유저/팀 협업 필요 시점에 서버 저장소로 전환 |
| **우선순위** | **P2 보조** |
| **노력** | 서버 전환 시: 백엔드 2일 (DynamoDB CRUD + FastAPI endpoints) |

### GAP-02: 프로젝트별 설정 저장 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET/PUT /api/projects/{id}/settings/{category}`, `POST .../test-connection/{db}` (8 endpoints) |
| **백엔드 현황** | OMA_Strands_Graph는 환경변수 기반 설정. API로 설정 저장/조회 미지원 |
| **판단** | **백엔드 변경 필요** — OMA_Strands_Graph에 Settings CRUD endpoint 추가. DB 접속 테스트는 기존 Oracle/PostgreSQL 커넥션 로직 활용 |
| **변경 대상** | OMA_Strands_Graph: 새 라우터 `api/settings/` 추가, DynamoDB 테이블 생성 |
| **우선순위** | **P1 중요** (DB 접속정보가 모든 기능의 전제) |
| **노력** | 백엔드 3일 |

### GAP-03: 기능 토글 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET/PUT /api/projects/{id}/features`, `PUT .../preset`, `GET /api/features/definitions`, `GET /api/features/presets` (5 endpoints) |
| **백엔드 현황** | 없음. 프론트엔드가 `src/data/feature-definitions.ts`에서 정적 정의, `ProjectContext`에서 localStorage 관리 |
| **판단** | **Mock 유지 (프론트엔드 localStorage)** — 기능 토글은 UI 표시 제어 목적이므로 서버 저장 불필요. 프론트엔드 단독으로 충분 |
| **우선순위** | **P2 보조** |
| **노력** | 서버 전환 시: 백엔드 1일 |

---

## 2. Dashboard API (4 endpoints)

### GAP-04: Dashboard 집계 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/dashboard/progress`, `/metrics`, `/tasks`, `/workflow` (4 endpoints) |
| **백엔드 현황** | OMA_Strands_Graph에 직접 대응 API 없음. 단, `GET /api/migrations` + `GET /api/migrations/{id}` + WebSocket 이벤트를 조합하면 데이터 추출 가능 |
| **판단** | **새로운 코드 추가** — OMA_Strands_Graph에 Dashboard용 집계 endpoint 4개 추가. 내부적으로 기존 마이그레이션 데이터를 집계하여 반환 |
| **변경 대상** | OMA_Strands_Graph: `api/dashboard/` 라우터 신규 추가 |
| **우선순위** | **P0 필수** (첫 화면) |
| **노력** | 백엔드 2일 |

---

## 3. DB Migration API (12 endpoints)

### GAP-05: DMS 파이프라인 6단계 세분화

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/db-migration/pipeline/steps`, `POST .../steps/{index}/run`, `POST .../run-all`, `GET .../steps/{index}/logs` (4 endpoints) |
| **백엔드 현황** | `POST /api/migrations`로 전체 마이그레이션을 1개 단위로 실행. WebSocket에서 `PHASE_START/PROGRESS/COMPLETE` 이벤트로 단계 진행 전송 |
| **판단** | **백엔드 변경 + 프론트엔드 매핑 혼합** |
| - 개별 단계 실행 (`steps/{index}/run`): 백엔드에 단계별 실행 API 추가 필요 |
| - 파이프라인 상태 조회: WebSocket `PHASE_*` 이벤트를 프론트엔드에서 6단계로 매핑 |
| - 로그 SSE: WebSocket `LOG_*` 이벤트를 SSE로 변환하는 어댑터 또는 프론트엔드에서 WebSocket 직접 사용 |
| **변경 대상** | OMA_Strands_Graph: `POST /api/migrations/{id}/phases/{phase}/run` 추가, 기존 오케스트레이터에 단계별 실행 모드 추가 |
| **우선순위** | **P0 필수** |
| **노력** | 백엔드 4일 (오케스트레이터 수정 포함) |

### GAP-06: Assessment 결과 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/db-migration/assessment` (필터/정렬), `GET .../assessment/summary` (2 endpoints) |
| **백엔드 현황** | `GET /api/migrations/{id}/report`에서 변환 결과를 포함하지만, 객체별 필터/정렬/요약 기능은 미지원 |
| **판단** | **새로운 코드 추가** — Report 데이터를 세분화하여 제공하는 Assessment 전용 endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: `api/db-migration/assessment/` 라우터 추가 |
| **우선순위** | **P0 필수** |
| **노력** | 백엔드 2일 |

### GAP-07: AI 에이전트 파이프라인 상태 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/db-migration/agent-pipeline`, `GET .../schema-conversions`, `GET .../schema-conversions/{objectName}` (3 endpoints) |
| **백엔드 현황** | WebSocket `NODE_START/PROGRESS/COMPLETE` 이벤트로 에이전트 상태 전송. 변환 결과는 `GET /api/migrations/{id}/report`에 포함 |
| **판단** | **새로운 코드 추가** — 에이전트 파이프라인 상태 조회 및 객체별 변환 상세 endpoint 추가. WebSocket 이벤트를 캐싱하여 REST로 제공 |
| **변경 대상** | OMA_Strands_Graph: `api/db-migration/agent-pipeline/` 라우터, Redis/DynamoDB에 중간 상태 캐싱 |
| **우선순위** | **P0 필수** |
| **노력** | 백엔드 3일 |

### GAP-08: 스키마 검증 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/db-migration/schema-validation` (1 endpoint) |
| **백엔드 현황** | QA Verifier 에이전트가 검증을 수행하지만 전용 REST endpoint 없음 |
| **판단** | **새로운 코드 추가** — QA Verifier 결과를 조회하는 endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: 기존 QA Verifier 출력을 REST로 노출 |
| **우선순위** | **P1 중요** |
| **노력** | 백엔드 1일 |

### GAP-09: 변환 컨텍스트 CRUD API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/db-migration/conversion-context`, `PUT .../conversion-context/{mappingType}` (2 endpoints) |
| **백엔드 현황** | 내부적으로 매핑 데이터를 사용하지만 CRUD API 미노출 |
| **판단** | **새로운 코드 추가** — 매핑 데이터 조회/수정 endpoint 추가. DynamoDB 또는 Redis에 저장 |
| **변경 대상** | OMA_Strands_Graph: `api/db-migration/conversion-context/` 라우터 추가 |
| **우선순위** | **P1 중요** (Advanced 프리셋 전용) |
| **노력** | 백엔드 2일 |

---

## 4. App Migration API (24 endpoints) — 가장 큰 갭

### GAP-10: 앱 마이그레이션 전체 API (FastAPI 래퍼 신규 구축)

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | 24개 endpoints: Mapper 탐색(2), SQL 추출(4), SQL 필터링(4), 쿼리 재작성(5), 수동 검수(4), XML 병합(4), 테스트 지원(4) + SSE/WebSocket |
| **백엔드 현황** | `strands-oracle-migration`은 **CLI only** — HTTP API가 전혀 없음. 핵심 기능(MyBatis 파싱, SQL 변환, XML 병합)은 Python 모듈로 존재 |
| **판단** | **새로운 코드 추가 (대규모)** — FastAPI 래퍼를 신규 구축하여 기존 Python 모듈을 HTTP API로 노출 |

**세부 갭 분류:**

#### GAP-10a: Mapper 탐색 (2 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `GET /api/app-migration/mapper-files`, `GET .../mapper-files/{path}` |
| **기존 모듈** | `dag_builder/extractors/mybatis_xml.py` — XML 파싱 + SQL 추출 로직 존재 |
| **작업** | FastAPI 라우터에서 `mybatis_xml.py`의 파싱 결과를 JSON으로 반환 |
| **우선순위** | **P0 필수** |
| **노력** | 1일 |

#### GAP-10b: SQL 추출 (4 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `POST .../extraction/execute`, `GET .../extraction/status` (SSE), `GET .../extraction/results`, `GET .../extraction/results/csv` |
| **기존 모듈** | `dag_builder/extractors/mybatis_xml.py` — 정적 추출 지원, `_extract_text_recursive()`로 동적 태그 평탄화 |
| **작업** | FastAPI BackgroundTask + SSE로 추출 진행률 스트리밍. CSV 다운로드 endpoint 추가 |
| **우선순위** | **P0 필수** |
| **노력** | 2일 |

#### GAP-10c: SQL 필터링 (4 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `GET .../filtering/results`, `PUT .../filtering/results/{sqlId}/category`, `POST .../filtering/rules`, `POST .../filtering/execute` |
| **기존 모듈** | `oracle_constructs.py` — 35+ Oracle 고유 패턴 감지. 결과를 `query.json`의 `oracle_constructs` 필드에 저장 |
| **작업** | 패턴 감지 결과를 "변환 필요 / 불필요 / 신규" 카테고리로 분류하는 로직 + CRUD endpoint |
| **우선순위** | **P0 필수** |
| **노력** | 2일 |

#### GAP-10d: 쿼리 재작성 — AI 변환 (5 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `POST .../query-rewrite/execute`, `GET .../query-rewrite/status`, `GET .../query-rewrite/results`, `GET .../query-rewrite/results/{sqlId}`, `GET .../query-rewrite/results/{sqlId}/agent-log` |
| **기존 모듈** | `sql_translator/` — sqlglot 결정론적 변환 + `TranslatorAgent` AI 폴백, `ProcedureTranslatorAgent` PL/SQL 변환 |
| **작업** | BackgroundTask로 변환 파이프라인 실행 + WebSocket으로 개별 SQL 변환 진행 이벤트 스트리밍. `query_store/` 파일시스템 결과를 JSON API로 제공 |
| **우선순위** | **P0 필수** (핵심 가치) |
| **노력** | 4일 (WebSocket + 병렬 실행 + 에이전트 trajectory 로깅) |

#### GAP-10e: 수동 검수 (4 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `GET .../manual-review/pending`, `PUT .../manual-review/{sqlId}`, `POST .../manual-review/{sqlId}/syntax-check`, `POST .../manual-review/{sqlId}/execute-compare` |
| **기존 모듈** | `PostgresTools.pg_explain`, `PostgresTools.pg_execute`, `OracleTools.ora_execute` — 양쪽 DB 실행 비교 도구 존재 |
| **작업** | 실패/수동검수 대상 SQL 필터링 + 수정 저장 + 양쪽 실행 비교 endpoint |
| **우선순위** | **P1 중요** |
| **노력** | 2일 |

#### GAP-10f: XML 병합 (4 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `POST .../xml-merge/execute`, `GET .../xml-merge/results`, `GET .../xml-merge/results/{fileName}/diff`, `GET .../xml-merge/results/{fileName}/download` |
| **기존 모듈** | `sql_translator/xml_transform.py` — 변환 SQL을 MyBatis XML에 재삽입, `_postgres_mappers/`에 출력 |
| **작업** | 기존 `xml_transform.py` + CLI `_merge_mapper_xmls`를 API로 래핑. diff 생성 + 파일 다운로드 |
| **우선순위** | **P1 중요** |
| **노력** | 2일 |

#### GAP-10g: 테스트 지원 (4 endpoints)

| 항목 | 내용 |
|------|------|
| **필요 API** | `GET .../test-errors`, `GET .../test-errors/auto-fixes`, `POST .../test-errors/{errorId}/approve`, `POST .../test-errors/{errorId}/reject` |
| **기존 모듈** | `VerifierAgent` — 변환 결과 검증, `comparison_status`/`comparison_notes` 필드로 결과 저장 |
| **작업** | 테스트 에러 수집 + 자동 수정 제안 로직 신규 구현 필요. AOP 로그 파싱은 미구현 |
| **우선순위** | **P1 중요** |
| **노력** | 3일 |

---

## 5. Data Migration API (7 endpoints)

### GAP-11: 데이터 이관 실행/모니터링 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/data-migration/tables`, `POST .../execute`, `POST .../stop`, `POST .../tables/{tableName}/retry` (4 endpoints) |
| **백엔드 현황** | OMA_Strands_Graph의 Data Migrator/Data Verifier 에이전트가 DMS 기반 이관 수행. `POST /api/migrations`로 시작, WebSocket `BATCH_PROGRESS` 이벤트로 진행률 전송 |
| **판단** | **백엔드 변경 필요** — 테이블 단위 실행/중지/재시도 제어 endpoint 추가. WebSocket 이벤트를 프론트엔드에서 직접 소비하거나 SSE 어댑터 추가 |
| **변경 대상** | OMA_Strands_Graph: `api/data-migration/` 라우터, 테이블 단위 제어 로직 추가 |
| **우선순위** | **P0 필수** |
| **노력** | 백엔드 3일 |

### GAP-12: 데이터 검증 API

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/data-migration/validation`, `POST .../validation/execute`, `GET .../validation/{tableName}` (3 endpoints) |
| **백엔드 현황** | Data Verifier 에이전트가 검증 수행하지만 전용 REST endpoint 없음 |
| **판단** | **새로운 코드 추가** — 검증 결과 조회/실행 endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: Data Verifier 결과를 REST로 노출 |
| **우선순위** | **P1 중요** |
| **노력** | 백엔드 2일 |

---

## 6. Tools API (14 endpoints)

### GAP-13: SQL 실행기

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `POST /api/tools/sql/execute`, `POST .../explain`, `POST .../compare`, `GET .../samples` (4 endpoints) |
| **백엔드 현황** | OMA_Strands_Graph 내부에 Oracle/PostgreSQL 커넥션 존재하지만, 임의 SQL 실행 API는 미제공 |
| **판단** | **새로운 코드 추가** — 보안 제약(읽기 전용, 쿼리 타임아웃, 결과 행 제한) 하에 SQL 실행 endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: `api/tools/sql/` 라우터 추가 |
| **우선순위** | **P1 중요** |
| **노력** | 백엔드 2일 |

### GAP-14: 로그 뷰어

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/tools/logs` (필터), `GET /api/tools/logs/stream` (SSE) (2 endpoints) |
| **백엔드 현황** | OMA_Strands_Graph WebSocket에서 `LOG_INFO/WARNING/ERROR` 이벤트 전송. 과거 로그 조회 API 없음 |
| **판단** | **백엔드 변경 필요** — 로그를 영속 저장소(CloudWatch 또는 파일)에 기록 + 조회/스트림 endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: 로그 영속화 + `api/tools/logs/` 라우터 추가 |
| **우선순위** | **P1 중요** |
| **노력** | 백엔드 2일 |

### GAP-15: 에이전트 로그 뷰어

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/tools/agent-logs` (에이전트 필터) (2 endpoints) |
| **백엔드 현황** | WebSocket에서 `NODE_*`, `AGENT_*` 이벤트 전송. 에이전트 trajectory 저장은 내부적으로 수행하지만 API 미노출 |
| **판단** | **새로운 코드 추가** — 에이전트 실행 로그를 DynamoDB에서 조회하는 endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: `api/tools/agent-logs/` 라우터 추가 |
| **우선순위** | **P2 보조** (Advanced 프리셋 전용) |
| **노력** | 백엔드 1일 |

### GAP-16: 변환 보고서

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `POST /api/tools/report/generate`, `GET .../status`, `GET .../report`, `GET .../report/download` (4 endpoints) |
| **백엔드 현황** | `GET /api/migrations/{id}/report`로 JSON/HTML 보고서 제공. 비동기 생성/상태 조회/다운로드는 미지원 |
| **판단** | **백엔드 변경 필요** — 기존 Report 에이전트를 활용하되, 비동기 생성 + 다운로드 형식(HTML/PDF) endpoint 추가 |
| **변경 대상** | OMA_Strands_Graph: `api/tools/report/` 라우터 확장, 기존 `/api/migrations/{id}/report` 재활용 |
| **우선순위** | **P1 중요** |
| **노력** | 백엔드 2일 |

### GAP-17: 지식 베이스

| 항목 | 내용 |
|------|------|
| **프론트엔드 요구** | `GET /api/tools/knowledge-base/patterns`, `POST .../patterns` (2 endpoints) |
| **백엔드 현황** | OMA_Strands_Graph에서 DynamoDB에 변환 패턴 저장하나 API 미노출. strands-oracle-migration의 `oracle_constructs.py`에 35+ 패턴 정의 |
| **판단** | **새로운 코드 추가** — 패턴 조회/추가 endpoint. 두 백엔드의 패턴을 통합하여 제공 |
| **변경 대상** | OMA_Strands_Graph: `api/tools/knowledge-base/` 라우터 추가 |
| **우선순위** | **P1 중요** |
| **노력** | 백엔드 2일 |

---

## 7. 실시간 스트리밍 갭

### GAP-18: SSE/WebSocket 스트리밍 통합

| 프론트엔드 요구 | 백엔드 현황 | 판단 |
|----------------|-----------|------|
| DMS 파이프라인 로그 — **SSE** | WebSocket `LOG_*`, `PHASE_*` 이벤트 | 프론트엔드에서 WebSocket 직접 사용 (SSE 불필요) |
| 에이전트 파이프라인 — SSE/Polling 5s | WebSocket `NODE_*`, `AGENT_*` 이벤트 | 프론트엔드에서 WebSocket 직접 사용 |
| SQL 추출 진행률 — **SSE** | 없음 (CLI) | strands-oracle-migration FastAPI에 SSE 추가 |
| 쿼리 재작성 진행 — **WebSocket** | 없음 (CLI) | strands-oracle-migration FastAPI에 WebSocket 추가 |
| 데이터 이관 진행 — **WebSocket** | WebSocket `BATCH_PROGRESS` 이벤트 | **이미 지원** — 프론트엔드 연동만 필요 |
| 시스템 로그 — **SSE** | WebSocket `LOG_*` 이벤트 | 프론트엔드에서 WebSocket 직접 사용 |
| 대시보드 작업 상태 — Polling 10s | WebSocket `PROGRESS_UPDATE` 이벤트 | 프론트엔드에서 Polling 또는 WebSocket 사용 |

**판단**: OMA_Strands_Graph의 WebSocket은 이미 충분한 이벤트를 전송하므로, 프론트엔드가 SSE 대신 WebSocket을 직접 사용하는 것이 효율적. strands-oracle-migration에는 SSE + WebSocket 신규 구현 필요.

| 우선순위 | **P0 필수** |
|----------|------------|
| 노력 | OMA_Strands_Graph 측: 0일 (기존 WebSocket 활용), strands-oracle-migration 측: 2일 |

---

## 8. 인프라/횡단 관심사 갭

### GAP-19: CORS 설정

| 항목 | 내용 |
|------|------|
| **현황** | OMA_Strands_Graph: `localhost:3000,8000`. strands-oracle-migration: 미설정 |
| **필요** | 프로덕션 도메인 추가, strands-oracle-migration FastAPI에 CORS 미들웨어 추가 |
| **우선순위** | **P0 필수** |
| **노력** | 0.5일 |

### GAP-20: 인증/인가

| 항목 | 내용 |
|------|------|
| **현황** | 두 백엔드 모두 인증 없음 |
| **필요** | JWT Bearer Token 기반 인증 (프로덕션) |
| **판단** | **P2 보조** — MVP에서는 네트워크 격리(VPC)로 대체. 프로덕션 배포 시 Cognito/ALB 인증 적용 |
| **노력** | 3일 (Cognito 설정 + 미들웨어) |

### GAP-21: 헬스체크 통합

| 항목 | 내용 |
|------|------|
| **현황** | OMA_Strands_Graph: `GET /api/health` 존재. strands-oracle-migration: 없음 |
| **필요** | 프론트엔드에서 두 백엔드 상태를 한눈에 확인 |
| **판단** | strands-oracle-migration FastAPI에 `/api/health` 추가 |
| **우선순위** | **P0 필수** |
| **노력** | 0.5일 |

---

## 9. 갭 요약 테이블

| GAP ID | 영역 | Endpoints | 판단 | 우선순위 | 노력(일) |
|--------|------|:---------:|------|:--------:|:--------:|
| GAP-01 | 프로젝트 CRUD | 6 | Mock 유지 (localStorage) | P2 | 0 (현재) |
| GAP-02 | 프로젝트 설정 | 8 | 백엔드 변경 (OMA_Strands_Graph) | P1 | 3 |
| GAP-03 | 기능 토글 | 5 | Mock 유지 (localStorage) | P2 | 0 (현재) |
| GAP-04 | Dashboard 집계 | 4 | 새 코드 추가 (OMA_Strands_Graph) | P0 | 2 |
| GAP-05 | DMS 파이프라인 | 4 | 백엔드 변경 + 프론트 매핑 | P0 | 4 |
| GAP-06 | Assessment 결과 | 2 | 새 코드 추가 (OMA_Strands_Graph) | P0 | 2 |
| GAP-07 | AI 에이전트 파이프라인 | 3 | 새 코드 추가 (OMA_Strands_Graph) | P0 | 3 |
| GAP-08 | 스키마 검증 | 1 | 새 코드 추가 (OMA_Strands_Graph) | P1 | 1 |
| GAP-09 | 변환 컨텍스트 | 2 | 새 코드 추가 (OMA_Strands_Graph) | P1 | 2 |
| GAP-10 | 앱 마이그레이션 전체 | 24 | **FastAPI 래퍼 신규** (strands-oracle-migration) | P0~P1 | 16 |
| GAP-11 | 데이터 이관 실행 | 4 | 백엔드 변경 (OMA_Strands_Graph) | P0 | 3 |
| GAP-12 | 데이터 검증 | 3 | 새 코드 추가 (OMA_Strands_Graph) | P1 | 2 |
| GAP-13 | SQL 실행기 | 4 | 새 코드 추가 (OMA_Strands_Graph) | P1 | 2 |
| GAP-14 | 로그 뷰어 | 2 | 백엔드 변경 (OMA_Strands_Graph) | P1 | 2 |
| GAP-15 | 에이전트 로그 | 2 | 새 코드 추가 (OMA_Strands_Graph) | P2 | 1 |
| GAP-16 | 변환 보고서 | 4 | 백엔드 변경 (OMA_Strands_Graph) | P1 | 2 |
| GAP-17 | 지식 베이스 | 2 | 새 코드 추가 (OMA_Strands_Graph) | P1 | 2 |
| GAP-18 | 실시간 스트리밍 | 7 스트림 | WebSocket 활용 + 신규 SSE | P0 | 2 |
| GAP-19 | CORS | - | 설정 변경 | P0 | 0.5 |
| GAP-20 | 인증/인가 | - | 프로덕션 단계 | P2 | 3 |
| GAP-21 | 헬스체크 | 1 | 새 코드 추가 | P0 | 0.5 |

---

## 10. 우선순위별 총 작업량

### P0 필수 — 기본 연동에 반드시 필요

| GAP | 영역 | 대상 백엔드 | 노력 |
|-----|------|-----------|:----:|
| GAP-04 | Dashboard 집계 | OMA_Strands_Graph | 2일 |
| GAP-05 | DMS 파이프라인 세분화 | OMA_Strands_Graph | 4일 |
| GAP-06 | Assessment 결과 | OMA_Strands_Graph | 2일 |
| GAP-07 | AI 에이전트 파이프라인 | OMA_Strands_Graph | 3일 |
| GAP-10a | Mapper 탐색 | strands-oracle-migration | 1일 |
| GAP-10b | SQL 추출 | strands-oracle-migration | 2일 |
| GAP-10c | SQL 필터링 | strands-oracle-migration | 2일 |
| GAP-10d | 쿼리 재작성 | strands-oracle-migration | 4일 |
| GAP-11 | 데이터 이관 실행 | OMA_Strands_Graph | 3일 |
| GAP-18 | 실시간 스트리밍 | 양쪽 | 2일 |
| GAP-19 | CORS | 양쪽 | 0.5일 |
| GAP-21 | 헬스체크 | strands-oracle-migration | 0.5일 |
| | | **P0 소계** | **26일** |

### P1 중요 — 완전한 기능에 필요

| GAP | 영역 | 대상 백엔드 | 노력 |
|-----|------|-----------|:----:|
| GAP-02 | 프로젝트 설정 | OMA_Strands_Graph | 3일 |
| GAP-08 | 스키마 검증 | OMA_Strands_Graph | 1일 |
| GAP-09 | 변환 컨텍스트 | OMA_Strands_Graph | 2일 |
| GAP-10e | 수동 검수 | strands-oracle-migration | 2일 |
| GAP-10f | XML 병합 | strands-oracle-migration | 2일 |
| GAP-10g | 테스트 지원 | strands-oracle-migration | 3일 |
| GAP-12 | 데이터 검증 | OMA_Strands_Graph | 2일 |
| GAP-13 | SQL 실행기 | OMA_Strands_Graph | 2일 |
| GAP-14 | 로그 뷰어 | OMA_Strands_Graph | 2일 |
| GAP-16 | 변환 보고서 | OMA_Strands_Graph | 2일 |
| GAP-17 | 지식 베이스 | OMA_Strands_Graph | 2일 |
| | | **P1 소계** | **23일** |

### P2 보조 — 향후 확장

| GAP | 영역 | 대상 | 노력 |
|-----|------|------|:----:|
| GAP-01 | 프로젝트 CRUD 서버 전환 | OMA_Strands_Graph | 2일 |
| GAP-03 | 기능 토글 서버 전환 | OMA_Strands_Graph | 1일 |
| GAP-15 | 에이전트 로그 | OMA_Strands_Graph | 1일 |
| GAP-20 | 인증/인가 | 양쪽 | 3일 |
| | | **P2 소계** | **7일** |

### 전체 합계

| 우선순위 | 작업량 |
|----------|:------:|
| P0 필수 | 26일 |
| P1 중요 | 23일 |
| P2 보조 | 7일 |
| **총계** | **56일** |

---

## 11. 백엔드별 작업 분배

### OMA_Strands_Graph (:8000) — 기존 API 확장

| 작업 유형 | 내용 | 노력 |
|----------|------|:----:|
| 기존 코드 변경 | DMS 파이프라인 세분화 (GAP-05), 보고서 확장 (GAP-16), 로그 영속화 (GAP-14) | 8일 |
| 새 endpoint 추가 | Dashboard (GAP-04), Assessment (GAP-06), AI 파이프라인 (GAP-07), 스키마 검증 (GAP-08), 컨텍스트 (GAP-09), 데이터 이관 (GAP-11), 검증 (GAP-12), SQL 실행 (GAP-13), 에이전트 로그 (GAP-15), 지식 베이스 (GAP-17), 설정 (GAP-02) | 24일 |
| 설정/인프라 | CORS (GAP-19), 인증 (GAP-20 일부) | 2일 |
| **OMA_Strands_Graph 소계** | | **34일** |

### strands-oracle-migration (:8001) — FastAPI 래퍼 신규 구축

| 작업 유형 | 내용 | 노력 |
|----------|------|:----:|
| FastAPI 프로젝트 셋업 | FastAPI + Uvicorn 초기 구조, CORS, 헬스체크 | 1일 |
| API 래핑 | 기존 Python 모듈을 HTTP endpoint로 노출 (GAP-10a~10g) | 16일 |
| 실시간 스트리밍 | SSE (추출 진행률) + WebSocket (쿼리 재작성) | 2일 |
| 인프라 | CORS, 인증 | 1일 |
| **strands-oracle-migration 소계** | | **20일** |

### 프론트엔드 (별도 추정)

> 프론트엔드 작업은 이 문서의 범위 밖이나 참고로 기록:
> - API Client Layer 구축 (`src/lib/api/`): 3일
> - Mock → Real 전환 (80 endpoints): 10일
> - WebSocket 클라이언트 통합: 3일
> - 에러 처리 + 로딩 상태: 2일
> - **프론트엔드 소계: ~18일**
