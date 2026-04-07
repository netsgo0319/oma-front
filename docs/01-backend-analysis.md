# OMA 백엔드 분석

> 현재 두 백엔드가 **무엇을 할 수 있는지** 정리한 문서.
> 프론트엔드가 필요로 하는 API는 [02-frontend-api-requirements.md](./02-frontend-api-requirements.md) 참조.

---

## 1. OMA_Strands_Graph (DB/데이터 마이그레이션 백엔드)

> 소스: [ren-ai-ssance/OMA_Strands_Graph](https://github.com/ren-ai-ssance/OMA_Strands_Graph)

### 1.1 기술 스택

| 항목 | 기술 |
|------|------|
| Framework | FastAPI + Uvicorn (Python 3.11+) |
| AI Agent | Strands Agents SDK + AWS Bedrock (Claude) |
| Source DB | Oracle XE 21c |
| Target DB | Aurora PostgreSQL 16.6 |
| State Store | Redis, DynamoDB (checkpoints), Neo4j (graph), pgvector |
| IaC | AWS CDK (Python) |
| API 문서 | `/api/docs` (Swagger), `/api/redoc` |

### 1.2 FastAPI 엔드포인트 (11개)

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

### 1.3 WebSocket 이벤트 스트림

**엔드포인트**: `/ws/migrations/{migration_id}`

25개 이벤트 타입을 실시간으로 전송:

| 카테고리 | 이벤트 |
|----------|--------|
| Lifecycle | `MIGRATION_START`, `MIGRATION_COMPLETE`, `MIGRATION_ERROR`, `MIGRATION_CANCELLED` |
| Phase | `PHASE_START`, `PHASE_PROGRESS`, `PHASE_COMPLETE` |
| Agent | `NODE_START`, `NODE_PROGRESS`, `NODE_COMPLETE`, `NODE_ERROR`, `AGENT_HANDOFF`, `AGENT_DECISION` |
| HITL | `HITL_APPROVAL_REQUIRED`, `HITL_APPROVED`, `HITL_REJECTED` |
| Progress | `CHECKPOINT_SAVED`, `PROGRESS_UPDATE`, `BATCH_PROGRESS` |
| Log | `LOG_INFO`, `LOG_WARNING`, `LOG_ERROR` |

이벤트 메시지 형식:

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

### 1.4 AI 에이전트 (9개)

| 에이전트 | 역할 |
|----------|------|
| **Discovery** | 소스 DB 스키마 분석, 변환 대상 식별 |
| **Schema Architect** | 스키마 구조 재설계 및 매핑 생성 |
| **Code Migrator** | PL/SQL → PL/pgSQL 코드 변환 |
| **QA Verifier** | 변환 결과 검증 및 테스트 실행 |
| **Evaluator** | 변환 품질 평가 및 점수 산정 |
| **Remediation** | 실패 객체 재시도 및 수정 |
| **Report** | 변환 보고서 생성 |
| **Data Migrator** | DMS 기반 데이터 이관 실행 |
| **Data Verifier** | 데이터 정합성 검증 |

에이전트 파이프라인은 5단계로 실행: Discovery → Schema Architect → Code Migrator → QA Verifier → Evaluator

### 1.5 CORS

`OMA_CORS_ORIGINS` 환경변수로 설정. 기본값: `localhost:3000`, `localhost:8000`.

---

## 2. strands-oracle-migration (앱 마이그레이션 백엔드)

> 소스: [cdanielsoh/strands-oracle-migration](https://github.com/cdanielsoh/strands-oracle-migration)

### 2.1 현재 상태

**CLI 도구만 존재. HTTP API / 웹 서버가 없다.**

| 항목 | 상태 |
|------|------|
| 인터페이스 | CLI만 제공 (`python -m dag_builder`, `python -m sql_translator`) |
| REST API | **없음** — FastAPI/Flask 미사용 |
| WebSocket | **없음** |
| 상태 저장소 | 파일시스템 (`query_store/` 디렉토리) |
| DB 연결 | Oracle (oracledb) + PostgreSQL (psycopg2) 직접 연결 |

### 2.2 기술 스택

| 컴포넌트 | 기술 |
|----------|------|
| AI Framework | Strands Agents SDK + AWS Bedrock (Claude Opus 4) |
| SQL 변환 | sqlglot >= 26.0 (결정론적) + AI Agent (복잡 쿼리 폴백) |
| 그래프 분석 | NetworkX >= 3.0 |
| 데이터 모델 | Pydantic v2 |
| Oracle | oracledb >= 2.0 |
| PostgreSQL | psycopg2-binary >= 2.9 |
| AWS | boto3 (Secrets Manager, Bedrock) |
| 대상 앱 | Spring Boot 3.2 + MyBatis 3.0 (Java) |

### 2.3 AI 에이전트 (5개)

| 에이전트 | 위치 | 역할 |
|----------|------|------|
| `TranslatorAgent` | `sql_translator/agents/translator.py` | 복잡 SQL 변환 (sqlglot 실패 시 AI 폴백, 재시도, 병렬 리전 실행) |
| `ProcedureTranslatorAgent` | `sql_translator/agents/procedure_translator.py` | PL/SQL → PL/pgSQL 변환 |
| `RefinerAgent` | `dag_builder/agents/refiner.py` | DAG 정제 (`needs_agent` 노드 해결, 고아 프로시저 분석) |
| `DagValidatorAgent` | `dag_builder/agents/dag_validator.py` | DAG 정합성 검증 |
| `VerifierAgent` | `dag_builder/agents/verifier.py` | 변환 결과 검증 |

에이전트에게 제공되는 도구:

| 도구 | 기능 |
|------|------|
| `PostgresTools` | `pg_explain`, `pg_execute`, `pg_get_table_columns`, `pg_write_sql`, `save_fixture`, `lookup_translation_rules` |
| `OracleTools` | `ora_get_table_columns`, `ora_get_table_constraints`, `ora_explain`, `ora_execute` |
| `RefinerTools` | `resolve_table_references`, `analyze_procedure_source`, `find_transitive_dependencies` |
| `DagTools` | DAG 조회/조작 |
| `QueryTools` | Query store 읽기/쓰기 |

### 2.4 핵심 기능

#### MyBatis XML 파싱

- **위치**: `dag_builder/extractors/mybatis_xml.py`
- `xml.etree.ElementTree`로 파싱
- namespace, statement ID, tag type (select/insert/update/delete) 처리
- 동적 SQL 태그 (`<if>`, `<choose>`, `<foreach>`) → `_extract_text_recursive()`로 평탄화
- `_DYNAMIC_TAG_RE` 정규식으로 동적 태그 감지 → `needs_agent` 플래그
- 바인드 변수: `#{param}` → `:param` 변환

#### Oracle 고유 구문 감지 (35+ 패턴)

- **위치**: `oracle_constructs.py`
- 계층: CONNECT_BY, SYS_CONNECT_BY_PATH, START_WITH, LEVEL
- 행 제한: ROWNUM, FETCH_FIRST
- 조인: `(+)` 외부 조인
- 함수: NVL, DECODE, SYSDATE, ADD_MONTHS, MONTHS_BETWEEN, TO_CHAR, TO_DATE, TRUNC, ROUND, SUBSTR, INSTR, REGEXP_LIKE, TO_NUMBER, LISTAGG, MEDIAN, STDDEV
- DML: MERGE INTO
- 분석함수: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, NTILE
- 그룹핑: ROLLUP, CUBE, GROUPING
- 시퀀스: SEQ.NEXTVAL

#### SQL 변환 파이프라인

```
MyBatis XML
    ↓
SQL 추출 + #{param} → :param + XML 언이스케이프
    ↓
전처리: (+) → ANSI JOIN, ROWNUM → LIMIT/OFFSET
    ↓
sqlglot.transpile(read="oracle", write="postgres")
    ↓ (실패 시)
TranslatorAgent (AI 변환)
    ↓
후처리: 날짜 포맷(RR→YY), 시퀀스(SEQ.NEXTVAL → nextval())
    ↓
EXPLAIN 검증 → 결과 비교 → XML 병합
```

#### XML 병합

- **위치**: `sql_translator/xml_transform.py`, CLI `_merge_mapper_xmls`
- 변환된 SQL을 MyBatis XML 태그 구조로 재포장
- **출력**: `query_store/_postgres_mappers/` 디렉토리에 완성된 mapper 파일

#### 테스트/검증

- Oracle과 PostgreSQL에서 동일 파라미터로 실행, 결과 비교
- 동적 SQL의 모든 분기 경로 검증 (branch verify)
- Spring Boot REST API 응답 비교 (Oracle vs PostgreSQL)
- 결과 저장: `query.json`의 `comparison_status`, `comparison_notes` 필드

### 2.5 데이터 저장 구조

```
query_store/
├── <query_name>/
│   ├── query.json              # 메타데이터 (상태, Oracle 구문, 비교 결과)
│   ├── source.mybatis.xml      # 원본 MyBatis XML
│   ├── query.oracle.sql        # Oracle SQL
│   ├── query.postgres.sql      # PostgreSQL SQL
│   ├── query.postgres.xml      # PostgreSQL MyBatis XML
│   ├── test_fixture.json       # 테스트 파라미터
│   ├── failed_attempts.json    # 실패한 변환 시도 기록
│   └── fail_report.md          # 실패 분석 보고서
├── _postgres_mappers/          # 병합된 최종 mapper 파일들
└── dag.json                    # 전체 의존성 그래프
```

---

## 3. AWS 서비스 연동

### 3.1 DMS Schema Conversion

OMA_Strands_Graph는 AWS DMS를 통해 스키마 변환을 수행:

- `POST /api/migrations` → DMS Schema Conversion 파이프라인 시작
- DMS Replication Instance를 통한 소스/타겟 연결
- WebSocket `PHASE_START/PROGRESS/COMPLETE` 이벤트로 변환 단계 추적
- DMS 실패 객체는 AI 에이전트(Remediation)가 재시도

### 3.2 AgentCore Runtime

두 백엔드 모두 **Strands Agents SDK** 기반으로 동작:

| 백엔드 | 에이전트 수 | 역할 |
|--------|:-----------:|------|
| OMA_Strands_Graph | 9개 | 스키마 분석/변환/검증/보고/데이터 이관 |
| strands-oracle-migration | 5개 | SQL 변환/검증/DAG 관리 |

에이전트는 Bedrock을 통해 Claude 모델을 호출하며, 도구(Tools)를 사용하여 DB 연결, SQL 실행, 파일 조작 등을 수행한다.

### 3.3 Bedrock 모델 사용

| 설정 항목 | 기본값 |
|----------|--------|
| Model ID | `anthropic.claude-sonnet-4-20250514` |
| Region | `us-east-1` |
| Max Remediation Retries | 3 |
| Evaluator Threshold | 80점 |
| Max Query Retries | 3 |
| Context Budget | 120,000 tokens |

---

## 4. 두 백엔드 비교 요약

| 영역 | OMA_Strands_Graph | strands-oracle-migration |
|------|-------------------|--------------------------|
| 스키마 변환 | DMS SC + 9개 에이전트 | 없음 |
| 데이터 이관 | DMS Full Load + 검증 | 없음 |
| MyBatis 파싱 | 기본 스캔 (`/api/analyze/mybatis`) | 정밀 파싱 (35+ Oracle 구문 감지) |
| SQL 변환 | 없음 | sqlglot + TranslatorAgent |
| 프로시저 변환 | 에이전트 기반 | ProcedureTranslatorAgent |
| 실행 결과 비교 | 없음 | Oracle↔PostgreSQL 실행 비교 |
| XML 병합 | 없음 | 완전 지원 |
| HTTP API | FastAPI 11개 + WebSocket | **없음 (CLI only)** |
| 배포 포트 | :8000 | :8001 (FastAPI 래퍼 신규 필요) |

### 두 백엔드의 관계

- **독립적이지만 보완적**: 스키마/데이터는 OMA_Strands_Graph, 앱 SQL은 strands-oracle-migration 담당
- **변환 컨텍스트 공유 필요**: OMA_Strands_Graph의 스키마 매핑 → strands-oracle-migration의 SQL 변환에서 참조
- **OMA_Strands_Graph에 앱 마이그레이션 관련 기능 일부 존재**: `POST /api/analyze/mybatis`, `mybatis_tools.py`, `sql_subgraph.py` — 별도 백엔드 대신 동일 백엔드 확장 가능성도 있음
