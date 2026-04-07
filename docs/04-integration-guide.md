# OMA 프론트엔드-백엔드 통합 가이드

> [03-gap-analysis.md](./03-gap-analysis.md)의 갭 분석 결과를 바탕으로 실제 통합 방법을 안내합니다.
>
> **최종 업데이트**: 2026-04-07
>
> **프론트엔드 현행**: React 18 + Vite 8 + Tailwind CSS v4 (LiteLLM 스타일 디자인).
> 라우팅: `/` (ProjectListPage) → `/project/:projectId/*` (AppLayout 내 25개 페이지).
> 상태: ProjectContext (localStorage) + FeatureFlags (3단계 프리셋) + MigrationScope (테이블 선택).

---

## 1. 통합 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OMA WebUI (React)                           │
│                     http://localhost:5173                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ API Client   │  │ WS Client    │  │ State Management         │  │
│  │ src/lib/api/ │  │ src/lib/ws/  │  │ ProjectContext (localStorage)│
│  │              │  │              │  │ FeatureFlags + MigrationScope│
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │
│         │                  │                                        │
└─────────┼──────────────────┼────────────────────────────────────────┘
          │ REST + SSE       │ WebSocket
          │                  │
    ┌─────┴──────────────────┴─────────────────────────────┐
    │                    ALB (:443)                          │
    │         path-based routing                            │
    │                                                       │
    │  /api/db-*      → OMA_Strands_Graph :8000            │
    │  /api/data-*    → OMA_Strands_Graph :8000            │
    │  /api/dashboard → OMA_Strands_Graph :8000            │
    │  /api/tools/*   → OMA_Strands_Graph :8000            │
    │  /api/app-*     → strands-oracle-migration :8001     │
    │  /ws/*          → OMA_Strands_Graph :8000            │
    └──────────┬────────────────────────┬───────────────────┘
               │                        │
    ┌──────────▼──────────┐  ┌──────────▼──────────┐
    │ OMA_Strands_Graph   │  │ strands-oracle-migr. │
    │ :8000               │  │ :8001                │
    │                     │  │                      │
    │ FastAPI (기존 확장)  │  │ FastAPI (신규 래퍼)  │
    │ + WebSocket         │  │ + SSE + WebSocket    │
    │                     │  │                      │
    │ 담당:               │  │ 담당:                │
    │ - Dashboard         │  │ - Mapper 탐색        │
    │ - DB Migration      │  │ - SQL 추출/필터링    │
    │ - Data Migration    │  │ - 쿼리 재작성 (AI)   │
    │ - Settings/Tools    │  │ - 수동 검수          │
    │                     │  │ - XML 병합           │
    └──────────┬──────────┘  │ - 테스트 지원        │
               │             └──────────┬───────────┘
    ┌──────────┼──────────────────────────┼──────────┐
    │          ▼              ▼           ▼          │
    │  ┌────────────┐ ┌────────────┐ ┌──────────┐   │
    │  │ RDS Oracle │ │ Aurora PG  │ │ Bedrock  │   │
    │  │ (Source)   │ │ (Target)   │ │ (Claude) │   │
    │  └────────────┘ └────────────┘ └──────────┘   │
    │                                                │
    │  ┌────────┐ ┌──────────┐ ┌────────┐           │
    │  │ Redis  │ │ DynamoDB │ │  S3    │           │
    │  └────────┘ └──────────┘ └────────┘           │
    │                VPC Private Subnets             │
    └────────────────────────────────────────────────┘
```

### 1.2 라우팅 전략

| 접두사 | 대상 백엔드 | 포트 |
|--------|-----------|:----:|
| `/api/dashboard/*` | OMA_Strands_Graph | 8000 |
| `/api/db-migration/*` | OMA_Strands_Graph | 8000 |
| `/api/data-migration/*` | OMA_Strands_Graph | 8000 |
| `/api/tools/*` | OMA_Strands_Graph | 8000 |
| `/api/projects/{id}/settings/*` | OMA_Strands_Graph | 8000 |
| `/api/health` (8000) | OMA_Strands_Graph | 8000 |
| `/api/app-migration/*` | strands-oracle-migration | 8001 |
| `/api/health` (8001) | strands-oracle-migration | 8001 |
| `/ws/migrations/*` | OMA_Strands_Graph | 8000 |

**프로젝트 관리/기능 토글** (`/api/projects`, `/api/features/*`): 프론트엔드 localStorage에서 처리. 백엔드 불필요 (MVP 단계).

### 1.3 개발 환경 프록시

Vite 개발 서버에서 두 백엔드로 프록시 설정:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api/app-migration': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
});
```

---

## 2. API 클라이언트 구조

### 2.1 디렉토리 설계

```
src/lib/api/
├── client.ts              # 공통 HTTP 클라이언트 (fetch 래퍼)
├── types.ts               # API 요청/응답 타입
├── dashboard.ts           # Dashboard API (GET progress, metrics, tasks, workflow)
├── db-migration.ts        # DB Migration API (pipeline, assessment, agent, validation, context)
├── app-migration.ts       # App Migration API (mapper, extraction, filtering, rewrite, review, merge, test)
├── data-migration.ts      # Data Migration API (tables, execute, validation)
├── tools.ts               # Tools API (sql, logs, report, knowledge-base)
├── settings.ts            # Settings API (project, agent, test settings)
└── index.ts               # Re-export all

src/lib/ws/
├── client.ts              # WebSocket 클라이언트 (재연결, 이벤트 디스패치)
├── events.ts              # WebSocket 이벤트 타입 정의
└── hooks.ts               # React hooks (useMigrationEvents, useLogStream)

src/lib/sse/
├── client.ts              # SSE 클라이언트
└── hooks.ts               # React hooks (usePipelineLogs, useExtractionProgress)
```

### 2.2 공통 HTTP 클라이언트

```typescript
// src/lib/api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const APP_API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString(), { headers: this.defaultHeaders });
    if (!res.ok) throw await this.handleError(res);
    return res.json();
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw await this.handleError(res);
    return res.json();
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.defaultHeaders,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await this.handleError(res);
    return res.json();
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });
    if (!res.ok) throw await this.handleError(res);
  }

  private async handleError(res: Response): Promise<Error> {
    const body = await res.json().catch(() => ({}));
    return new Error(body.error || `API Error: ${res.status}`);
  }
}

// 두 백엔드용 클라이언트 인스턴스
export const dbApi = new ApiClient({ baseUrl: API_BASE_URL });
export const appApi = new ApiClient({ baseUrl: APP_API_BASE_URL });
```

### 2.3 모듈별 API 함수 예시

```typescript
// src/lib/api/dashboard.ts
import { dbApi } from './client';

export const dashboardApi = {
  getProgress: () => dbApi.get('/dashboard/progress'),
  getMetrics: () => dbApi.get('/dashboard/metrics'),
  getTasks: () => dbApi.get('/dashboard/tasks'),
  getWorkflow: () => dbApi.get('/dashboard/workflow'),
};

// src/lib/api/app-migration.ts
import { appApi } from './client';

export const appMigrationApi = {
  getMapperFiles: () => appApi.get('/app-migration/mapper-files'),
  getMapperFile: (path: string) => appApi.get(`/app-migration/mapper-files/${encodeURIComponent(path)}`),
  executeExtraction: (mode: 'static' | 'dynamic') => appApi.post('/app-migration/extraction/execute', { mode }),
  getExtractionResults: () => appApi.get('/app-migration/extraction/results'),
  executeQueryRewrite: (mode: 'sample' | 'full') => appApi.post('/app-migration/query-rewrite/execute', { mode }),
  getQueryRewriteResults: () => appApi.get('/app-migration/query-rewrite/results'),
  // ... 나머지 endpoints
};
```

### 2.4 WebSocket 클라이언트

```typescript
// src/lib/ws/client.ts

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

type EventHandler = (event: MigrationEvent) => void;

class WsClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(migrationId: string) {
    this.ws = new WebSocket(`${WS_URL}/migrations/${migrationId}`);
    this.ws.onmessage = (msg) => {
      const event = JSON.parse(msg.data) as MigrationEvent;
      this.dispatch(event.event_type, event);
    };
    this.ws.onclose = () => this.tryReconnect(migrationId);
  }

  on(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) this.handlers.set(eventType, new Set());
    this.handlers.get(eventType)!.add(handler);
    return () => this.handlers.get(eventType)?.delete(handler);
  }

  private dispatch(eventType: string, event: MigrationEvent) {
    this.handlers.get(eventType)?.forEach((h) => h(event));
    this.handlers.get('*')?.forEach((h) => h(event));  // wildcard
  }

  private tryReconnect(migrationId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(migrationId), 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.reconnectAttempts = 0;
  }
}

export const wsClient = new WsClient();
```

---

## 3. Mock → Real 전환 패턴

### 3.1 환경 변수 기반 전환

```typescript
// src/lib/api/index.ts

import * as mockDashboard from '@/data/dashboard';
import { dashboardApi } from './dashboard';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const api = {
  dashboard: USE_MOCK
    ? {
        getProgress: async () => ({
          dbMigration: mockDashboard.progressData.dbMigration,
          appMigration: mockDashboard.progressData.appMigration,
          dataMigration: mockDashboard.progressData.dataMigration,
        }),
        getMetrics: async () => mockDashboard.conversionMetrics,
        getTasks: async () => mockDashboard.recentTasks,
        getWorkflow: async () => mockDashboard.workflowSteps,
      }
    : dashboardApi,
  // ... 다른 모듈도 동일 패턴
};
```

### 3.2 페이지별 전환 순서

각 페이지에서 `src/data/*.ts` import를 `src/lib/api` 호출로 교체:

```typescript
// BEFORE (Mock)
import { dmsPipelineSteps } from '@/data/db-migration';

export default function DmsExecutionPage() {
  const [steps, setSteps] = useState(dmsPipelineSteps);
  // ...
}

// AFTER (Real API)
import { api } from '@/lib/api';

export default function DmsExecutionPage() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dbMigration.getPipelineSteps()
      .then(setSteps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  // ...
}
```

### 3.3 전환 체크리스트

| 단계 | 파일 | Mock 소스 | API 엔드포인트 |
|:----:|------|----------|---------------|
| 1 | `DashboardPage.tsx` | `dashboard.ts` | `GET /api/dashboard/*` |
| 2 | `DmsExecutionPage.tsx` | `db-migration.ts` → `dmsPipelineSteps` | `GET /api/db-migration/pipeline/steps` |
| 3 | `DmsResultsPage.tsx` | `db-migration.ts` → `assessmentResults` | `GET /api/db-migration/assessment` |
| 4 | `AiSchemaPage.tsx` | `db-migration.ts` → `agentPipeline`, `schemaConversions` | `GET /api/db-migration/agent-pipeline`, `schema-conversions` |
| 5 | `SchemaValidationPage.tsx` | `db-migration.ts` → `schemaValidation` | `GET /api/db-migration/schema-validation` |
| 6 | `ConversionContextPage.tsx` | `db-migration.ts` → `conversionContext` | `GET /api/db-migration/conversion-context` |
| 7 | `MapperExplorerPage.tsx` | `app-migration.ts` → `mapperFiles` | `GET /api/app-migration/mapper-files` |
| 8 | `SqlExtractionPage.tsx` | `app-migration.ts` → `extractedSqls` | `GET /api/app-migration/extraction/results` |
| 9 | `SqlFilteringPage.tsx` | `app-migration.ts` → `filterResults` | `GET /api/app-migration/filtering/results` |
| 10 | `QueryRewritePage.tsx` | `app-migration.ts` → `queryRewriteResults` | `GET /api/app-migration/query-rewrite/results` |
| 11 | `ManualReviewPage.tsx` | (없음) | `GET /api/app-migration/manual-review/pending` |
| 12 | `XmlMergePage.tsx` | `app-migration.ts` → `xmlMergeResults` | `GET /api/app-migration/xml-merge/results` |
| 13 | `DataExecutionPage.tsx` | `data-migration.ts` → `migrationTables` | `GET /api/data-migration/tables` |
| 14 | `DataValidationPage.tsx` | `data-migration.ts` → `validationResults` | `GET /api/data-migration/validation` |
| 15 | `SqlExecutorPage.tsx` | `tools.ts` → `sampleQueries` | `POST /api/tools/sql/execute` |
| 16 | `LogViewerPage.tsx` | `tools.ts` → `realtimeLogs` | `GET /api/tools/logs/stream` (SSE) |
| 17 | `AgentLogPage.tsx` | `tools.ts` → `agentLogs` | `GET /api/tools/agent-logs` |
| 18 | `ConversionReportPage.tsx` | `tools.ts` → `reportSections` | `GET /api/tools/report` |
| 19 | `KnowledgeBasePage.tsx` | `tools.ts` → `conversionPatterns` | `GET /api/tools/knowledge-base/patterns` |
| 20 | Settings 페이지들 | `settings.ts` | `GET/PUT /api/projects/{id}/settings/*` |

---

## 4. 단계별 통합 순서

### Phase 1: 기반 구축 + 테이블 카탈로그 + Dashboard (1주)

```
목표: API 클라이언트 레이어 구축 + 테이블 카탈로그 연동 + 첫 번째 연동 성공

1. [프론트엔드] src/lib/api/ 공통 클라이언트 구축
2. [프론트엔드] src/lib/ws/ WebSocket 클라이언트 구축
3. [프론트엔드] VITE_USE_MOCK 환경 변수 기반 전환 메커니즘
4. [프론트엔드] vite.config.ts 프록시 설정
5. [백엔드:8000] 테이블 카탈로그 API 3개 추가 (GAP-00) ★신규
   - GET /api/catalog/schemas (Oracle ALL_TABLES 기반 스키마 목록)
   - GET /api/catalog/schemas/{schema}/tables (스키마 내 테이블 목록 + rowCount/sizeMb)
   - GET /api/catalog/tables (전체 테이블 목록)
6. [프론트엔드] ProjectListPage 프로젝트 생성 Step 2에서 카탈로그 API 연동
   - 현재: src/data/table-catalog.ts 목데이터 → Real API 전환
   - MigrationScope (전체/스키마/테이블 선택) 서버 저장
7. [백엔드:8000] Dashboard 집계 API 4개 추가 (GAP-04)
8. [백엔드:8000] CORS 설정 확인 (GAP-19)
9. [프론트엔드] DashboardPage → Real API 전환
```

**의존성**: 백엔드:8000 실행 가능 + Oracle 소스 DB 접속 가능 (카탈로그 쿼리용)

### Phase 2: DB Migration 핵심 (2주)

```
목표: DMS 파이프라인 + AI 에이전트 실시간 연동

1. [백엔드:8000] DMS 파이프라인 6단계 세분화 API (GAP-05)
2. [백엔드:8000] Assessment 결과 API (GAP-06)
3. [백엔드:8000] AI 에이전트 파이프라인 API (GAP-07)
4. [프론트엔드] DmsExecutionPage → WebSocket 이벤트 기반 실시간 상태
5. [프론트엔드] DmsResultsPage → Assessment API 연동
6. [프론트엔드] AiSchemaPage → 에이전트 파이프라인 + 변환 결과 연동
7. [백엔드:8000] 스키마 검증 API (GAP-08)
8. [프론트엔드] SchemaValidationPage 연동
```

### Phase 3: App Migration (2주)

```
목표: strands-oracle-migration FastAPI 래퍼 구축 + 프론트 연동

1. [백엔드:8001] FastAPI 프로젝트 셋업 (라우터, CORS, 헬스체크)
2. [백엔드:8001] Mapper 탐색 API 2개 (GAP-10a)
3. [백엔드:8001] SQL 추출 API 4개 + SSE (GAP-10b)
4. [백엔드:8001] SQL 필터링 API 4개 (GAP-10c)
5. [백엔드:8001] 쿼리 재작성 API 5개 + WebSocket (GAP-10d)
6. [프론트엔드] MapperExplorerPage → appApi 연동
7. [프론트엔드] SqlExtractionPage → SSE 진행률 연동
8. [프론트엔드] SqlFilteringPage 연동
9. [프론트엔드] QueryRewritePage → WebSocket 실시간 변환 연동
```

### Phase 4: Data Migration + 도구 (1주)

```
목표: 데이터 이관 연동 + 부가 도구

1. [백엔드:8000] 데이터 이관 실행/모니터링 API (GAP-11)
2. [백엔드:8000] 데이터 검증 API (GAP-12)
3. [프론트엔드] DataExecutionPage → WebSocket 실시간 진행
4. [프론트엔드] DataValidationPage 연동
5. [백엔드:8000] SQL 실행기 API (GAP-13)
6. [백엔드:8000] 로그 뷰어 API (GAP-14)
7. [프론트엔드] SqlExecutorPage, LogViewerPage 연동
```

### Phase 5: 나머지 기능 + 안정화 (1주)

```
목표: 잔여 P1 기능 + 수동 검수/XML 병합 + 설정

1. [백엔드:8001] 수동 검수 API (GAP-10e)
2. [백엔드:8001] XML 병합 API (GAP-10f)
3. [백엔드:8001] 테스트 지원 API (GAP-10g)
4. [백엔드:8000] 설정 저장 API (GAP-02)
5. [백엔드:8000] 변환 컨텍스트 CRUD (GAP-09)
6. [백엔드:8000] 변환 보고서 API (GAP-16)
7. [백엔드:8000] 지식 베이스 API (GAP-17)
8. [프론트엔드] 나머지 페이지 연동 + 에러 처리
```

---

## 5. 인프라 요구사항

### 5.1 AWS 리소스

| 리소스 | 용도 | 사양 |
|--------|------|------|
| **ECS Fargate** (Task 1) | OMA_Strands_Graph | 4 vCPU / 8 GB |
| **ECS Fargate** (Task 2) | strands-oracle-migration FastAPI | 4 vCPU / 8 GB |
| **ALB** | API 라우팅 | path-based routing, WebSocket 지원 |
| **S3 + CloudFront** | WebUI 정적 호스팅 | dist/ 배포 |
| **RDS Oracle** | 소스 DB | 고객 환경 또는 Oracle XE 21c |
| **Aurora PostgreSQL** | 타겟 DB | 16.x, db.r6g.large |
| **ElastiCache Redis** | 상태 캐싱 | cache.t3.medium |
| **DynamoDB** | 체크포인트, 설정 저장 | On-demand |
| **DMS Replication Instance** | 스키마 변환 + 데이터 이관 | dms.r5.large |
| **Bedrock** | AI 에이전트 | Claude Sonnet 4 |
| **Secrets Manager** | DB 비밀번호 | Oracle/PostgreSQL 자격증명 |
| **ACM** | SSL 인증서 | `*.oma.example.com` |

### 5.2 네트워크

```
VPC (10.0.0.0/16)
├── Public Subnets     → ALB, NAT Gateway
├── Private Subnets    → ECS Tasks, RDS, DMS, Redis
└── Security Groups:
    ALB SG       ← 443 from 0.0.0.0/0
    Backend SG   ← 8000,8001 from ALB SG
    Oracle SG    ← 1521 from Backend SG, DMS SG
    PG SG        ← 5432 from Backend SG, DMS SG
    Redis SG     ← 6379 from Backend SG
```

### 5.3 IAM

ECS Task Role에 필요한 권한:
- `dms:*`, `dms-sc:*` — DMS 제어
- `s3:GetObject/PutObject/ListBucket` on `oma-*` — 아티팩트 저장
- `bedrock:InvokeModel*` — AI 에이전트
- `secretsmanager:GetSecretValue` on `oma-*` — DB 자격증명
- `dynamodb:GetItem/PutItem/Query/Scan` on `oma-*` — 상태 저장
- `logs:CreateLogStream/PutLogEvents` — CloudWatch 로그

상세 IAM 정책은 [04-infrastructure-requirements.md](./04-infrastructure-requirements.md#4-iam-역할) 참조.

---

## 6. 환경 변수

### 6.1 프론트엔드 (.env)

```bash
# API 연결
VITE_API_BASE_URL=http://localhost:8000/api       # DB/Data Migration + Tools
VITE_APP_API_BASE_URL=http://localhost:8001/api   # App Migration
VITE_WS_URL=ws://localhost:8000/ws                # WebSocket

# Mock 모드
VITE_USE_MOCK=true                                # true → Mock 데이터, false → Real API
```

프로덕션 배포 시:

```bash
VITE_API_BASE_URL=https://api.oma.example.com/api
VITE_APP_API_BASE_URL=https://api.oma.example.com/api   # ALB에서 라우팅
VITE_WS_URL=wss://api.oma.example.com/ws
VITE_USE_MOCK=false
```

### 6.2 OMA_Strands_Graph (.env)

```bash
# 서버
OMA_HOST=0.0.0.0
OMA_PORT=8000
OMA_CORS_ORIGINS=http://localhost:5173,https://oma.example.com

# Oracle (소스)
OMA_ORACLE_HOST=oma-source.xxxx.rds.amazonaws.com
OMA_ORACLE_PORT=1521
OMA_ORACLE_SID=OMAPROD
OMA_ORACLE_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456:secret:oma-oracle-xxx

# PostgreSQL (타겟)
OMA_POSTGRES_HOST=oma-target.cluster-xxxx.us-east-1.rds.amazonaws.com
OMA_POSTGRES_PORT=5432
OMA_POSTGRES_DB=omaprod
OMA_POSTGRES_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456:secret:oma-postgres-xxx

# AWS
OMA_BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-20250514
OMA_BEDROCK_REGION=us-east-1
OMA_DMS_REPLICATION_INSTANCE_ARN=arn:aws:dms:us-east-1:123456:rep:xxx
OMA_S3_BUCKET=oma-artifacts-123456

# State Store
OMA_REDIS_URL=redis://oma-cache.xxxx.cache.amazonaws.com:6379
OMA_DYNAMODB_TABLE_PREFIX=oma-
```

### 6.3 strands-oracle-migration (.env)

```bash
# 서버
APP_HOST=0.0.0.0
APP_PORT=8001
APP_CORS_ORIGINS=http://localhost:5173,https://oma.example.com

# Oracle (소스)
ORACLE_HOST=oma-source.xxxx.rds.amazonaws.com
ORACLE_PORT=1521
ORACLE_SID=OMAPROD
ORACLE_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456:secret:oma-oracle-xxx

# PostgreSQL (타겟)
POSTGRES_HOST=oma-target.cluster-xxxx.us-east-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=omaprod
POSTGRES_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456:secret:oma-postgres-xxx

# AWS
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-20250514
BEDROCK_REGION=us-east-1

# 파일시스템
QUERY_STORE_PATH=/data/query_store
MYBATIS_XML_PATH=/data/mybatis-mappers
```

---

## 7. 실시간 통신 통합 상세

### 7.1 OMA_Strands_Graph WebSocket → 프론트엔드 매핑

OMA_Strands_Graph의 기존 WebSocket (`/ws/migrations/{id}`)은 25개 이벤트를 전송합니다.
프론트엔드 페이지별로 필요한 이벤트를 필터링하여 사용합니다:

| 프론트엔드 페이지 | 소비할 WebSocket 이벤트 | UI 반영 |
|------------------|----------------------|---------|
| `DmsExecutionPage` | `PHASE_START`, `PHASE_PROGRESS`, `PHASE_COMPLETE`, `LOG_*` | 6단계 파이프라인 상태 + 로그 |
| `AiSchemaPage` | `NODE_START`, `NODE_PROGRESS`, `NODE_COMPLETE`, `AGENT_HANDOFF` | 에이전트 5단계 상태 |
| `DashboardPage` | `PROGRESS_UPDATE`, `MIGRATION_COMPLETE` | 전체 진행률 갱신 |
| `DataExecutionPage` | `BATCH_PROGRESS`, `PHASE_COMPLETE` (data phase) | 테이블별 진행률 |

```typescript
// 사용 예시: DmsExecutionPage에서
import { wsClient } from '@/lib/ws/client';

function DmsExecutionPage() {
  useEffect(() => {
    wsClient.connect(migrationId);

    const unsub1 = wsClient.on('PHASE_START', (e) => updateStep(e.phase, 'running'));
    const unsub2 = wsClient.on('PHASE_COMPLETE', (e) => updateStep(e.phase, 'completed'));
    const unsub3 = wsClient.on('LOG_INFO', (e) => appendLog(e.message));

    return () => { unsub1(); unsub2(); unsub3(); wsClient.disconnect(); };
  }, [migrationId]);
}
```

### 7.2 strands-oracle-migration 실시간 신규 구현

| 기능 | 방식 | 엔드포인트 | 이벤트 형식 |
|------|------|-----------|-----------|
| SQL 추출 진행률 | **SSE** | `GET /api/app-migration/extraction/status` | `data: {"progress": 0.45, "current": 11, "total": 24, "currentFile": "EmployeeMapper.xml"}` |
| 쿼리 재작성 | **WebSocket** | `ws://localhost:8001/ws/query-rewrite/{taskId}` | `{"event": "SQL_CONVERTED", "sqlId": "sql-012", "status": "pass", "retryCount": 2}` |

---

## 8. 에러 처리 전략

### 8.1 API 에러

```typescript
// 글로벌 에러 핸들러
class ApiError extends Error {
  constructor(public status: number, public detail?: string) {
    super(`API Error ${status}: ${detail || 'Unknown'}`);
  }
}

// Toast 알림 연동
function useApiCall<T>(apiCall: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiCall());
    } catch (e) {
      setError(e as ApiError);
      // Toast 알림 표시
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}
```

### 8.2 WebSocket 재연결

- 연결 끊김 시 지수 백오프로 재연결 (1s, 2s, 4s, 8s, 16s)
- 최대 5회 시도 후 사용자에게 수동 재연결 버튼 표시
- 재연결 시 마지막 이벤트 timestamp 전송하여 놓친 이벤트 수신

### 8.3 Mock 폴백

`VITE_USE_MOCK=false`이더라도 API 호출 실패 시 Mock 데이터로 폴백하는 옵션:

```typescript
async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: T): Promise<T> {
  try {
    return await apiCall();
  } catch {
    console.warn('API call failed, falling back to mock data');
    return mockData;
  }
}
```

---

## 9. 프로젝트 관리 / 기능 토글 — localStorage 유지

프로젝트 CRUD와 기능 토글은 **백엔드 API 없이 프론트엔드 localStorage에서 계속 관리**합니다.

| 기능 | 현재 구현 | 통합 후 | 이유 |
|------|----------|---------|------|
| 프로젝트 CRUD | `ProjectContext` + localStorage | **변경 없음** | 단일 사용자 MVP, 서버 저장 불필요 |
| 기능 플래그 | `feature-definitions.ts` + localStorage | **변경 없음** | UI 표시 제어 목적, 서버 동기화 불필요 |
| 프리셋 전환 | `ProjectContext.setFeaturePreset()` | **변경 없음** | 클라이언트 사이드 로직 |

**서버 전환 시점**: 멀티유저/팀 협업, 감사 로그 필요 시 GAP-01, GAP-03 구현.

---

## 10. 통합 테스트 전략

### 10.1 헬스체크 검증

```bash
# 두 백엔드 헬스체크
curl http://localhost:8000/api/health   # OMA_Strands_Graph
curl http://localhost:8001/api/health   # strands-oracle-migration
```

### 10.2 E2E 통합 테스트 시나리오

| # | 시나리오 | 커버하는 갭 |
|---|---------|-----------|
| 1 | Dashboard 로드 → 진행률/지표/작업 표시 | GAP-04 |
| 2 | DMS 파이프라인 실행 → 실시간 로그 → 완료 | GAP-05, GAP-18 |
| 3 | Assessment 결과 필터링 → 상세 보기 | GAP-06 |
| 4 | AI 에이전트 변환 → 실시간 상태 → DDL 비교 | GAP-07 |
| 5 | Mapper 파일 탐색 → SQL 추출 → 필터링 → 재작성 | GAP-10a~d |
| 6 | 데이터 이관 실행 → 실시간 진행 → 검증 | GAP-11, GAP-12 |
| 7 | SQL 실행기에서 양쪽 DB 쿼리 비교 | GAP-13 |
| 8 | 설정 변경 → 접속 테스트 → 저장 | GAP-02 |
