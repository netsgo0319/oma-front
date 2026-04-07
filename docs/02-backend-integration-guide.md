# OMA WebUI v2 — Backend Integration Guide

> DB/데이터 마이그레이션 백엔드: [OMA_Strands_Graph](https://github.com/ren-ai-ssance/OMA_Strands_Graph)
> 앱 마이그레이션 백엔드: [strands-oracle-migration](https://github.com/cdanielsoh/strands-oracle-migration) — FastAPI 래퍼 신규 구축 필요

---

## 1. 아키텍처 전체 그림

```
┌──────────────────────────────────────────────────────┐
│                   OMA WebUI v2 (React)                │
│                                                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │
│  │ Dashboard  │  │ DB/Data   │  │ App Migration     │ │
│  │           │  │ Migration │  │                   │ │
│  │           │  │ Pages     │  │ Pages             │ │
│  └─────┬─────┘  └─────┬─────┘  └────────┬──────────┘ │
│        │              │                  │            │
│    ────┴──────────────┴──────────────────┴─────────   │
│              src/lib/api.ts (API Client Layer)        │
└──────────────────┬──────────────────┬─────────────────┘
                   │ REST + WebSocket │ REST + SSE
                   ▼                  ▼
┌──────────────────────────┐  ┌─────────────────────────┐
│  OMA_Strands_Graph       │  │  App Migration Backend  │
│  (DB/Data Migration)     │  │  (strands-oracle-migr.) │
│                          │  │                         │
│  FastAPI :8000           │  │  FastAPI :8001 (신규)   │
│  /api/migrations         │  │  /api/app-migration/*   │
│  /ws/migrations/{id}     │  │                         │
│                          │  │                         │
│  ┌─────┐ ┌──────┐       │  │                         │
│  │ DMS │ │Bedrock│       │  │                         │
│  │ SC  │ │Claude │       │  │                         │
│  └─────┘ └──────┘       │  │                         │
│  ┌──────┐ ┌──────┐      │  │                         │
│  │Oracle│ │Postgr│      │  │                         │
│  │  DB  │ │ SQL  │      │  │                         │
│  └──────┘ └──────┘      │  │                         │
└──────────────────────────┘  └─────────────────────────┘
```

---

## 2. OMA_Strands_Graph 분석 결과

### 2.1 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | FastAPI + Uvicorn (Python 3.11+) |
| AI Agent | Strands Agents SDK + AWS Bedrock (Claude) |
| Agent 수 | 9개 (Discovery, Schema Architect, Code Migrator, QA Verifier, Evaluator, Remediation, Report, Data Migrator, Data Verifier) |
| DB | Oracle XE 21c (source), Aurora PostgreSQL 16.6 (target) |
| State | Redis, DynamoDB (checkpoints), Neo4j (graph), pgvector |
| IaC | AWS CDK (Python) |
| API Docs | `/api/docs` (Swagger), `/api/redoc` |

### 2.2 제공 API

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/migrations` | 마이그레이션 시작 (소스/타겟 DB 설정, 옵션) |
| GET | `/api/migrations` | 마이그레이션 목록 (페이지네이션) |
| GET | `/api/migrations/{id}` | 마이그레이션 상태 및 진행률 |
| POST | `/api/migrations/{id}/approve` | Human-in-the-loop 승인 |
| POST | `/api/migrations/{id}/cancel` | 마이그레이션 취소 |
| GET | `/api/migrations/{id}/report` | 마이그레이션 보고서 (JSON/HTML) |
| POST | `/api/migrations/{id}/config` | 실행 중 설정 변경 |
| POST | `/api/analyze/schema` | 스키마 분석 (마이그레이션 없이) |
| POST | `/api/analyze/mybatis` | MyBatis XML 스캔 |
| POST | `/api/analyze/complexity` | 변환 복잡도 평가 |
| GET | `/api/health` | 헬스체크 (Oracle, PostgreSQL, Bedrock) |

### 2.3 WebSocket

**`/ws/migrations/{migration_id}`** — 25개 이벤트 타입 실시간 스트림:

| 카테고리 | 이벤트 |
|----------|--------|
| Lifecycle | `MIGRATION_START`, `MIGRATION_COMPLETE`, `MIGRATION_ERROR`, `MIGRATION_CANCELLED` |
| Phase | `PHASE_START`, `PHASE_PROGRESS`, `PHASE_COMPLETE` |
| Agent | `NODE_START`, `NODE_PROGRESS`, `NODE_COMPLETE`, `NODE_ERROR`, `AGENT_HANDOFF`, `AGENT_DECISION` |
| HITL | `HITL_APPROVAL_REQUIRED`, `HITL_APPROVED`, `HITL_REJECTED` |
| Progress | `CHECKPOINT_SAVED`, `PROGRESS_UPDATE`, `BATCH_PROGRESS` |
| Log | `LOG_INFO`, `LOG_WARNING`, `LOG_ERROR` |

이벤트 형식:
```json
{
  "event_type": "NODE_PROGRESS",
  "timestamp": "2026-04-07T10:30:00Z",
  "migration_id": "mig-001",
  "phase": "schema",
  "node_name": "code_migrator",
  "agent_name": "Code Migrator",
  "progress": 0.65,
  "message": "Converting PKG_ORDER.PROC_CALC_TOTAL...",
  "data": { ... }
}
```

### 2.4 CORS

`OMA_CORS_ORIGINS` 환경변수로 설정. 기본값: `localhost:3000`, `localhost:8000`.

---

## 3. 프론트엔드 ↔ OMA_Strands_Graph 매핑

### 3.1 Dashboard

| 프론트엔드 기능 | 백엔드 API | 매핑 방식 |
|----------------|-----------|----------|
| 3대 영역 진행률 | `GET /api/migrations/{id}` → progress 필드 | 마이그레이션 ID로 조회, phase별 progress 추출 |
| 핵심 지표 카드 | `GET /api/migrations/{id}/report` → 보고서에서 추출 | 또는 별도 summary API 필요 |
| 실시간 작업 상태 | `/ws/migrations/{id}` → 이벤트 스트림 | WebSocket 연결, 이벤트별 상태 업데이트 |
| 워크플로우 다이어그램 | `GET /api/migrations/{id}` → phase/node 상태 | phase 진행 상황을 다이어그램 노드에 매핑 |

### 3.2 DB Migration

| 프론트엔드 페이지 | 백엔드 연동 방식 |
|-------------------|-----------------|
| **DMS SC 실행** | `POST /api/migrations` (phase: schema)로 시작. WebSocket에서 `PHASE_START/PROGRESS/COMPLETE` 이벤트로 6단계 추적. `LOG_INFO/WARNING/ERROR` 이벤트가 로그 뷰어에 표시 |
| **DMS SC 결과** | `POST /api/analyze/schema` 또는 마이그레이션 완료 후 `GET /api/migrations/{id}/report`에서 assessment 섹션 추출 |
| **AI 에이전트 스키마 변환** | WebSocket `NODE_START/PROGRESS/COMPLETE` 이벤트로 5단계 에이전트 추적. `AGENT_DECISION` 이벤트에서 변환 결과(DDL 비교, 점수) 수신 |
| **PostgreSQL 스키마 검증** | 마이그레이션 report의 QA Verifier 결과 활용 |
| **변환 컨텍스트 관리** | 마이그레이션 report의 매핑 정보 활용. 수정 기능은 별도 API 필요 (현재 미제공) |

### 3.3 Data Migration

| 프론트엔드 페이지 | 백엔드 연동 방식 |
|-------------------|-----------------|
| **데이터 이관 실행** | `POST /api/migrations` (phase: data)로 시작. WebSocket `BATCH_PROGRESS` 이벤트로 테이블별 진행률 추적 |
| **데이터 검증** | WebSocket `NODE_COMPLETE` (data_verifier) 이벤트 또는 report에서 검증 결과 추출 |

### 3.4 Tools

| 프론트엔드 페이지 | 백엔드 연동 방식 |
|-------------------|-----------------|
| **SQL 실행기** | **별도 API 필요** — OMA_Strands_Graph에 직접 SQL 실행 endpoint 없음. 추가 개발 또는 직접 DB 접속 필요 |
| **로그 뷰어** | WebSocket `LOG_*` 이벤트 활용 |
| **에이전트 로그** | WebSocket `AGENT_DECISION`, `NODE_*` 이벤트 활용 |
| **변환 보고서** | `GET /api/migrations/{id}/report?format=html` |
| **지식 베이스** | **별도 API 필요** — DynamoDB 패턴 메모리 직접 조회 API 추가 필요 |

### 3.5 Settings

| 프론트엔드 페이지 | 백엔드 연동 방식 |
|-------------------|-----------------|
| **프로젝트 설정** | 마이그레이션 시작 시 `POST /api/migrations` body에 포함. 접속 테스트는 `GET /api/health` 활용 가능 |
| **에이전트 설정** | `POST /api/migrations/{id}/config`로 실행 중 변경 가능 |
| **테스트 설정** | **별도 API 필요** — 바인드 변수/데이터소스 설정 저장 |

---

## 4. 앱 마이그레이션 백엔드

> 소스: [cdanielsoh/strands-oracle-migration](https://github.com/cdanielsoh/strands-oracle-migration)
> 상세 분석: [`docs/05-app-migration-backend-analysis.md`](./05-app-migration-backend-analysis.md)

### 현재 상태

**CLI 도구만 존재, HTTP API 없음.** 핵심 로직(파싱, 변환, 검증, 병합)은 모두 갖추고 있으나 FastAPI 래퍼를 신규 구축해야 합니다.

| 항목 | 보유 여부 |
|------|:---------:|
| MyBatis XML 파싱 (35+ Oracle 구문 감지) | ✅ |
| sqlglot 결정론적 변환 + AI Agent 폴백 | ✅ |
| PL/SQL → PL/pgSQL 변환 | ✅ |
| Oracle↔PostgreSQL 실행 결과 비교 | ✅ |
| XML 병합 (mapper 재조립) | ✅ |
| **FastAPI REST API** | ❌ 신규 필요 |
| **실시간 스트리밍 (SSE/WebSocket)** | ❌ 신규 필요 |

### 프론트엔드 ↔ 앱 백엔드 매핑

| 프론트엔드 페이지 | 백엔드 모듈 | 연동 방식 |
|-------------------|-----------|----------|
| **Mapper 파일 탐색** | `MyBatisXmlExtractor.extract()` → `DagNode` 리스트 | 즉시 응답 |
| **SQL 추출** | `extract_sql_from_xml()` + `query_store/` 스캔 | 비동기 (10-30s) |
| **SQL 필터링** | `classify_sql()` (oracle_constructs.py) | 즉시 응답 |
| **쿼리 재작성** | `pipeline._translate()` (sqlglot) + `TranslatorAgent` (AI) | **장시간 (30-60s/쿼리)** → SSE 스트리밍 필요 |
| **수동 검수** | `Query.write_pg_sql()` + `pg_explain` + `ora_execute`/`pg_execute` | 즉시~5s |
| **XML 병합** | `_merge_mapper_xmls()` → `_postgres_mappers/` | 중간 (5-10s) |
| **테스트 지원** | `compare_query_store()` + `branch_verify` | 중간 |

### 필요한 작업

1. **FastAPI 래퍼 구축**: 기존 Python 모듈을 import하여 24개 REST endpoint 노출
2. **비동기 작업 관리**: 쿼리 재작성은 BackgroundTask + SSE로 진행률 스트리밍
3. **파일 저장소 → API 추상화**: `query_store/` 파일을 JSON API 응답으로 변환
4. **CORS 설정**: 프론트엔드 도메인 허용

### 연동 시 고려사항

1. **앱 소스 경로**: WebUI 설정의 `appSourcePath`를 API에 전달하여 mapper 스캔 경로로 사용
2. **변환 컨텍스트 공유**: OMA_Strands_Graph의 스키마 매핑 → 앱 백엔드의 SQL 변환에서 참조 필요. 공유 저장소(S3/Redis) 또는 API 호출
3. **배포**: 동일 ECS 클러스터에 별도 서비스, ALB 경로 분리 (`/api/db-*` → Strands Graph, `/api/app-*` → App Migration)

---

## 5. 프론트엔드 API Client 구조 제안

```
src/
├── lib/
│   ├── api.ts              # Axios/fetch 인스턴스, interceptors, 에러 처리
│   ├── ws.ts               # WebSocket 클라이언트 (reconnect, event parsing)
│   └── utils.ts            # 기존 유틸
├── hooks/
│   ├── useTheme.ts         # 기존
│   ├── useApi.ts           # API 호출 hook (loading/error/data)
│   ├── useWebSocket.ts     # WebSocket 연결 hook
│   └── useMigration.ts     # 마이그레이션 상태 관리 hook
```

### 환경 변수

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws

# .env.production
VITE_API_BASE_URL=https://agentcore.internal/api
VITE_WS_URL=wss://agentcore.internal/ws
```

### Mock ↔ Real 전환 패턴

```typescript
// src/lib/api.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function fetchDashboardProgress() {
  if (USE_MOCK) {
    const { migrationProgress } = await import('@/data/dashboard')
    return migrationProgress
  }
  const res = await fetch(`${API_BASE}/dashboard/progress`)
  return res.json()
}
```

이 패턴으로 Mock과 실제 API를 환경 변수 하나로 전환할 수 있습니다.
