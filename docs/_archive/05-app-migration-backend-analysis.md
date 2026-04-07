# OMA WebUI v2 — App Migration Backend 분석

> 소스: [cdanielsoh/strands-oracle-migration](https://github.com/cdanielsoh/strands-oracle-migration)

---

## 1. 현재 상태 요약

**이 프로젝트는 CLI 도구이며, HTTP API / 웹 서버가 없습니다.**

| 항목 | 상태 |
|------|------|
| 인터페이스 | CLI만 제공 (`python -m dag_builder`, `python -m sql_translator`) |
| REST API | **없음** — FastAPI/Flask 등 웹 프레임워크 미사용 |
| WebSocket | **없음** |
| 상태 저장소 | 파일시스템 (`query_store/` 디렉토리) |
| 데이터베이스 | Oracle (oracledb) + PostgreSQL (psycopg2) 직접 연결 |

→ **프론트엔드 연동을 위해 FastAPI 래퍼 API를 새로 구축해야 합니다.**

---

## 2. 기술 스택

| 컴포넌트 | 기술 |
|----------|------|
| AI Framework | Strands Agents SDK + AWS Bedrock (Claude Opus 4) |
| SQL 변환 | sqlglot >= 26.0 (결정론적 변환) + AI Agent (복잡 쿼리) |
| 그래프 분석 | NetworkX >= 3.0 |
| 데이터 모델 | Pydantic v2 |
| Oracle | oracledb >= 2.0 |
| PostgreSQL | psycopg2-binary >= 2.9 |
| AWS | boto3 (Secrets Manager, Bedrock) |
| 대상 앱 | Spring Boot 3.2 + MyBatis 3.0 (Java) |

---

## 3. 에이전트 아키텍처

### 에이전트 목록 (5개)

| 에이전트 | 위치 | 역할 |
|----------|------|------|
| `TranslatorAgent` | `sql_translator/agents/translator.py` | 복잡 SQL 변환 (sqlglot 실패 시 AI 변환, 재시도, 병렬 리전 실행) |
| `ProcedureTranslatorAgent` | `sql_translator/agents/procedure_translator.py` | PL/SQL → PL/pgSQL 변환 |
| `RefinerAgent` | `dag_builder/agents/refiner.py` | DAG 정제 (`needs_agent` 노드 해결, 고아 프로시저 분석) |
| `DagValidatorAgent` | `dag_builder/agents/dag_validator.py` | DAG 정합성 검증 |
| `VerifierAgent` | `dag_builder/agents/verifier.py` | 변환 결과 검증 |

### 도구 목록

| 도구 | 제공 기능 |
|------|----------|
| `PostgresTools` | `pg_explain`, `pg_execute`, `pg_get_table_columns`, `pg_write_sql`, `save_fixture`, `lookup_translation_rules` |
| `OracleTools` | `ora_get_table_columns`, `ora_get_table_constraints`, `ora_explain`, `ora_execute` |
| `RefinerTools` | `resolve_table_references`, `analyze_procedure_source`, `find_transitive_dependencies` |
| `DagTools` | DAG 조회/조작 도구 |
| `QueryTools` | Query store 읽기/쓰기 도구 |

---

## 4. 핵심 기능별 분석

### 4.1 MyBatis XML 파싱

- **위치**: `dag_builder/extractors/mybatis_xml.py`
- **방식**: `xml.etree.ElementTree`로 파싱
- **처리 항목**: namespace, statement ID, tag type (select/insert/update/delete)
- **동적 SQL**: `<if>`, `<choose>`, `<foreach>` 등을 `_extract_text_recursive()`로 평탄화
- **동적 태그 감지**: `_DYNAMIC_TAG_RE` 정규식 → `needs_agent` 플래그
- **바인드 변수**: `#{param}` → `:param` 변환

### 4.2 Oracle 고유 구문 감지 (35+ 패턴)

- **위치**: `oracle_constructs.py`
- **감지 패턴**:
  - 계층: CONNECT_BY, SYS_CONNECT_BY_PATH, START_WITH, LEVEL
  - 행 제한: ROWNUM, FETCH_FIRST
  - 조인: `(+)` 외부 조인
  - 함수: NVL, DECODE, SYSDATE, ADD_MONTHS, MONTHS_BETWEEN, TO_CHAR, TO_DATE, TRUNC, ROUND, SUBSTR, INSTR, REGEXP_LIKE, TO_NUMBER, LISTAGG, MEDIAN, STDDEV
  - DML: MERGE INTO
  - 분석: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, NTILE
  - 그룹핑: ROLLUP, CUBE, GROUPING
  - 시퀀스: SEQ.NEXTVAL

### 4.3 SQL 변환 파이프라인

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

### 4.4 XML 병합

- **위치**: `sql_translator/xml_transform.py`, CLI `_merge_mapper_xmls`
- **기능**: 변환된 SQL을 MyBatis XML 태그 구조로 재포장
- **출력**: `query_store/_postgres_mappers/` 디렉토리에 완성된 mapper 파일

### 4.5 테스트/검증

- **쿼리 비교**: Oracle과 PostgreSQL에서 동일 파라미터로 실행, 결과 비교
- **브랜치 검증**: 동적 SQL의 모든 분기 경로 검증
- **엔드포인트 테스트**: Spring Boot REST API 응답 비교 (Oracle vs PostgreSQL)
- **결과 저장**: `query.json`의 `comparison_status`, `comparison_notes` 필드

### 4.6 데이터 저장 구조

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

## 5. 프론트엔드 ↔ 앱 마이그레이션 백엔드 매핑

### 프론트엔드 페이지별 필요 기능 vs 백엔드 보유 기능

| 프론트엔드 페이지 | 필요 기능 | 백엔드 보유 | API 필요 |
|-------------------|----------|:-----------:|:--------:|
| **Mapper 파일 탐색** | 디렉토리 스캔, 파일별 SQL 통계, XML 미리보기 | `MyBatisXmlExtractor`, `DagModel` | ✅ 신규 |
| **SQL 추출** | 정적/동적 추출, CSV 내보내기 | `extract_sql_from_xml()`, `query_store/` | ✅ 신규 |
| **SQL 필터링** | Oracle 구문 감지, 3분류 | `classify_sql()`, `oracle_constructs` | ✅ 신규 |
| **쿼리 재작성** | AI 변환, 테스트, 재시도, diff | `TranslatorAgent`, `pipeline._translate()` | ✅ 신규 |
| **수동 검수** | SQL 편집, 구문 검증, 실행 비교 | `pg_explain`, `ora_execute`/`pg_execute` | ✅ 신규 |
| **XML 병합** | 변환 SQL → XML 병합, diff, 다운로드 | `wrap_verified_as_xml()`, `_merge_mapper_xmls()` | ✅ 신규 |
| **테스트 지원** | 에러 수집, 결과 비교, 자동 수정 | `compare_query_store()`, `branch_verify` | ✅ 신규 |

→ **모든 기능의 핵심 로직은 존재하지만, API 래퍼가 전부 없습니다.**

---

## 6. 필요한 API 래퍼 설계

### 6.1 FastAPI 래퍼 구조 제안

```
app_migration_api/
├── main.py                     # FastAPI app, CORS, startup
├── routes/
│   ├── mapper.py               # Mapper 탐색 API
│   ├── extraction.py           # SQL 추출 API
│   ├── filtering.py            # SQL 필터링 API
│   ├── rewrite.py              # 쿼리 재작성 API
│   ├── review.py               # 수동 검수 API
│   ├── merge.py                # XML 병합 API
│   └── test.py                 # 테스트 지원 API
├── services/
│   └── (기존 dag_builder, sql_translator 모듈 import)
├── models/
│   └── schemas.py              # Pydantic request/response 모델
└── background/
    └── tasks.py                # 장시간 작업 (변환, 비교) 비동기 실행
```

### 6.2 API ↔ 기존 모듈 매핑

| API Endpoint | HTTP | 호출할 기존 모듈 | 실행 시간 |
|--------------|------|-----------------|----------|
| `/api/app-migration/mapper-files` | GET | `MyBatisXmlExtractor.extract()` → `DagNode` 리스트 | 즉시 (~1s) |
| `/api/app-migration/mapper-files/{path}` | GET | 파일 읽기 | 즉시 |
| `/api/app-migration/extraction/execute` | POST | `dag_builder` CLI 로직 | 중간 (~10-30s) |
| `/api/app-migration/extraction/results` | GET | `query_store/` 디렉토리 스캔 → `query.json` 집계 | 즉시 |
| `/api/app-migration/extraction/results/csv` | GET | `query.json` → CSV 변환 | 즉시 |
| `/api/app-migration/filtering/results` | GET | `classify_sql()` → 분류 결과 | 즉시 |
| `/api/app-migration/filtering/results/{id}/category` | PUT | `query.json` 메타데이터 수정 | 즉시 |
| `/api/app-migration/query-rewrite/execute` | POST | `sql_translator --all` 또는 `--translate-agent` | **장시간 (30-60s/쿼리)** |
| `/api/app-migration/query-rewrite/results` | GET | `query_store/` 스캔, 상태별 집계 | 즉시 |
| `/api/app-migration/query-rewrite/results/{id}` | GET | `query.json` + `.oracle.sql` + `.postgres.sql` | 즉시 |
| `/api/app-migration/query-rewrite/results/{id}/agent-log` | GET | `failed_attempts.json`, agent trajectory | 즉시 |
| `/api/app-migration/manual-review/pending` | GET | `query_store/` 필터 (status=fail) | 즉시 |
| `/api/app-migration/manual-review/{id}` | PUT | `Query.write_pg_sql()` | 즉시 |
| `/api/app-migration/manual-review/{id}/syntax-check` | POST | `PostgresTools.pg_explain()` | 즉시 (~1s) |
| `/api/app-migration/manual-review/{id}/execute-compare` | POST | `ora_execute()` + `pg_execute()` | 중간 (~5s) |
| `/api/app-migration/xml-merge/execute` | POST | `_merge_mapper_xmls()` | 중간 (~5-10s) |
| `/api/app-migration/xml-merge/results` | GET | `_postgres_mappers/` 디렉토리 스캔 | 즉시 |
| `/api/app-migration/xml-merge/results/{file}/diff` | GET | 원본 vs 병합 파일 비교 | 즉시 |
| `/api/app-migration/xml-merge/results/{file}/download` | GET | 병합 파일 반환 | 즉시 |
| `/api/app-migration/test-errors` | GET | `compare_query_store()` 결과 | 즉시 |
| `/api/app-migration/test-errors/{id}/approve` | POST | 검증 상태 업데이트 | 즉시 |

### 6.3 장시간 작업 처리

쿼리 재작성은 **쿼리당 30-60초**가 소요됩니다. 전체 변환은 수십 분~수 시간.

```
POST /api/app-migration/query-rewrite/execute
  → 202 Accepted + { jobId: "xxx" }

GET /api/app-migration/query-rewrite/status
  → { jobId: "xxx", status: "running", current: 15, total: 234, 
      success: 12, fail: 2, retry: 1 }

SSE /api/app-migration/query-rewrite/stream
  → 개별 SQL 변환 완료 시마다 이벤트 전송
```

**구현 방안**:
- FastAPI `BackgroundTasks` 또는 `asyncio.create_task`
- Redis 큐 (Celery) — 대규모 병렬 처리 시
- 진행률은 파일시스템 (`query_store/` 내 `query.json` 상태) 기반 폴링 또는 SSE

---

## 7. OMA_Strands_Graph와의 관계

두 백엔드는 **독립적이지만 보완적**입니다:

| 영역 | OMA_Strands_Graph | strands-oracle-migration |
|------|-------------------|--------------------------|
| 스키마 변환 | DMS SC + 9개 에이전트 | 없음 |
| 데이터 이관 | DMS Full Load + 검증 | 없음 |
| MyBatis 파싱 | 기본 스캔 (`/api/analyze/mybatis`) | 정밀 파싱 (35+ Oracle 구문 감지) |
| SQL 변환 | 없음 | sqlglot + TranslatorAgent |
| 프로시저 변환 | 에이전트 기반 | ProcedureTranslatorAgent |
| 결과 비교 | 없음 | Oracle↔PostgreSQL 실행 비교 |
| XML 병합 | 없음 | 완전 지원 |
| API | FastAPI 11 endpoints + WebSocket | **없음 (CLI only)** |

### 연동 시 고려사항

1. **변환 컨텍스트 공유**: OMA_Strands_Graph의 스키마 매핑 결과 → strands-oracle-migration의 SQL 변환에서 참조 필요
2. **공유 저장소**: 두 백엔드가 동일 S3/Redis/DynamoDB를 바라보면 컨텍스트 공유 가능
3. **통합 배포**: 동일 ECS 클러스터에 별도 서비스로 배포, ALB 경로 분리 (`/api/db-*` → Strands Graph, `/api/app-*` → App Migration)

---

## 8. 핵심 요약

| 항목 | 상태 |
|------|------|
| 핵심 로직 (파싱, 변환, 검증, 병합) | ✅ 모두 존재 |
| HTTP API | ❌ **전혀 없음** — FastAPI 래퍼 전체 신규 구축 필요 |
| 실시간 스트리밍 | ❌ 없음 — SSE/WebSocket 신규 구축 필요 |
| 인증/인가 | ❌ 없음 |
| 상태 저장 | 파일시스템 기반 (query_store/) — DB 전환 검토 필요 |
| 프론트엔드 연동 난이도 | **중간** — 로직은 있고, API 껍질만 씌우면 됨 |
