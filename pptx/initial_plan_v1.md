# OMA WebUI v2 발표자료 계획 (10분)

> **목적**: 구현된 기능, 아키텍처, 앞으로의 작업을 10분 내에 전달
> **청중**: 프로젝트 관계자 (기술 리더, PM, 백엔드 개발자)
> **디자인 스타일**: Swiss International (기능적 · 기업용) 또는 Bento Grid (모듈형 · 구조적)

---

## 슬라이드 구성 (총 12장, 약 10분)

### Slide 1 — 타이틀 (30초)
**Oracle Migration Accelerator — WebUI v2 현황 및 로드맵**
- 프로젝트명, 날짜, 발표자
- 한 줄 요약: "Oracle→PostgreSQL 마이그레이션을 가속하는 통합 UI"

---

### Slide 2 — 문제 정의 (1분)
**왜 OMA WebUI가 필요한가?**
- Oracle DB 수천 개 테이블 → PostgreSQL 전환 시 수작업 한계
- AWS DMS Schema Conversion만으로는 60~70%만 자동 변환
- 나머지 30~40%: AI 에이전트 + 수동 검토 필요
- 앱(MyBatis SQL) 마이그레이션은 별도 도구 필요
- **해결**: 3단계(DB → App → Data)를 하나의 UI에서 관리

---

### Slide 3 — 아키텍처 개요 (1분)
**시스템 구조도**
```
[OMA WebUI] ←→ [ALB] ←→ [OMA_Strands_Graph :8000] ←→ [Bedrock / AgentCore]
                      ←→ [strands-oracle-migration :8001] (FastAPI 래퍼 필요)
                      ←→ [AWS DMS / S3]
```
- 프론트: React 18 + TypeScript + Vite + Tailwind (LiteLLM 디자인)
- 백엔드 2개: DB 마이그레이션(FastAPI + Strands SDK), 앱 마이그레이션(CLI + AI Agent)
- 의사결정: BFF 대신 백엔드 직접 수정 방식 채택 (docs 문서화됨)

---

### Slide 4 — 프로젝트 관리 체계 (1분)
**멀티 프로젝트 + 마이그레이션 스코프**
- 프로젝트 목록 대시보드 (`/`) → 프로젝트 진입 (`/project/:id`)
- 프로젝트 생성 2단계: 이름/프리셋 → **테이블 범위 선택** (전체/스키마/개별 테이블)
  - 예: Oracle DB 3,000 테이블 → 300개씩 10개 프로젝트로 분할
- 프로젝트별 독립 설정, 기능 토글, 진행 상태
- 스크린샷: ProjectListPage 카드 그리드

---

### Slide 5 — 기능 토글 시스템 (1분)
**3단계 프리셋으로 사용자 수준별 UI**

| 프리셋 | 기능 수 | 대상 |
|--------|:------:|------|
| Basic | 10개 | 처음 사용자, POC |
| Standard | 17개 | 일반 마이그레이션 (기본값) |
| Advanced | 23개 | 전문가 |

- 설정 > 기능 관리 페이지에서 프리셋 선택 또는 개별 토글
- 비활성 기능: 사이드바에서 자동 숨김, URL 직접 접속 시 안내 페이지
- **목적**: "기능이 너무 많아 헷갈린다" → 필요한 것만 보이게

---

### Slide 6 — DB 마이그레이션 (1분)
**DMS + AI 에이전트 협업 파이프라인**
- OMA 통합 파이프라인 6단계 (스키마 변환 4 + 데이터 복제 2)
- 각 단계 "AWS DMS" / "OMA 확장" 배지로 출처 구분
- Assessment 결과: 변환 완료 / 실패 → 실패 항목은 AI 에이전트로 리트라이
- AI 에이전트: 5/9 스키마 변환 에이전트 표시 (Discovery → Evaluator)
- 스크린샷: DmsExecutionPage 파이프라인 + 배지

---

### Slide 7 — 앱 마이그레이션 (1분)
**MyBatis SQL 변환 7단계 워크플로우**
1. Mapper 탐색 → 2. SQL 추출 (정적 + **런타임 로그 수집**) → 3. SQL 필터링
4. 쿼리 변환 (AI) → 5. 수동 검토 → 6. XML 병합 → 7. 테스트 지원
- 런타임 로그 수집: AOP/Interceptor로 실제 실행 SQL 캡처 (신규)
- 실패 시 에러 복구 경로: Query Rewrite 실패 → Manual Review CTA
- 스크린샷: QueryRewritePage diff 뷰 또는 SqlExtractionPage 런타임 모드

---

### Slide 8 — UX 개선 사항 (30초)
**사용자 혼란 요소 제거**
- 워크플로우 위치 표시: 각 페이지 상단 "Step X/10" 진행률 바
- 온보딩 모달: 첫 방문 시 3단계 설정 가이드
- 설정 페이지: 마이그레이션 범위 조회/수정, 필드별 툴팁
- destructive 배지 색상 수정 (글자 안 보이던 문제)

---

### Slide 9 — 백엔드 연동 현황 & 갭 (1분)
**현재 상태: Mock 데이터 기반 프론트엔드 완성**

| 구분 | 프론트 요구 | 백엔드 제공 | 갭 |
|------|:---------:|:--------:|:---:|
| REST API | 83개 | 11개 | **72개** |
| 앱 마이그레이션 | 24개 | 0개 (CLI만) | **전체 신규** |
| 프로젝트 관리 | 19개 | 0개 | Mock 유지 가능 |
| 실시간 스트림 | 7개 | 1개 (WS) | 부분 매칭 |

- 문서화 완료: 4개 docs (백엔드 분석, API 요구사항, 갭 분석, 통합 가이드)

---

### Slide 10 — 통합 로드맵 (1분)
**5단계 통합 계획 (총 7주)**

```
Phase 1 (1주)  기반 구축 + 테이블 카탈로그 + Dashboard
Phase 2 (2주)  DB Migration 핵심 (DMS + AI Agent 실시간)
Phase 3 (2주)  App Migration (FastAPI 래퍼 신규 구축)
Phase 4 (1주)  수동 검토 + 테스트 지원
Phase 5 (1주)  도구 + 설정 연동
```

- Phase 1 완료 시 첫 End-to-End 데모 가능
- Phase 3이 최대 리스크 (CLI→HTTP 래퍼 신규 구축)

---

### Slide 11 — 기술 스택 & 산출물 (30초)
**기술 스택**
- Frontend: React 18, TypeScript, Vite 8, Tailwind CSS v4, React Router v6
- Design: LiteLLM 디자인 컨셉 (인디고 브랜드, compact sidebar, 13px 폰트)
- Backend: OMA_Strands_Graph (FastAPI), strands-oracle-migration (CLI)
- Infra: AWS ECS Fargate, ALB, S3, DMS, Bedrock, AgentCore

**산출물**
- 25개 페이지 프론트엔드 (빌드 성공, dev 서버 운영 중)
- 4개 통합 문서 (docs/)
- GitHub Private Repo

---

### Slide 12 — Q&A + 다음 단계 (1분)
**즉시 가능한 액션**
1. Phase 1 착수: API 클라이언트 구축 + 테이블 카탈로그 API
2. OMA_Strands_Graph 백엔드에 프론트엔드 전용 endpoint 추가
3. strands-oracle-migration FastAPI 래퍼 설계 시작

**논의 포인트**
- 프로젝트 관리: localStorage vs 서버 저장소 전환 시점?
- 앱 마이그레이션 FastAPI 래퍼: 담당 팀/리소스?
- 배포 환경: CloudFront + S3 정적 배포 vs ECS?

---

## 발표 시간 배분

| 구간 | 슬라이드 | 시간 |
|------|---------|:----:|
| 도입 | 1-2 | 1.5분 |
| 아키텍처 + 핵심 기능 | 3-7 | 5분 |
| UX + 갭 분석 | 8-9 | 1.5분 |
| 로드맵 + 마무리 | 10-12 | 2분 |
| **합계** | **12장** | **10분** |

---

## 스크린샷 필요 목록

1. ProjectListPage — 프로젝트 카드 그리드 (2개 프로젝트 + 생성 폼)
2. ProjectListPage Step 2 — 마이그레이션 스코프 선택 (스키마 체크박스)
3. DmsExecutionPage — 파이프라인 + AWS DMS/OMA 배지
4. DmsResultsPage — Assessment 결과 + "AI 에이전트로 변환" 버튼
5. QueryRewritePage — Oracle→PostgreSQL diff 뷰
6. SqlExtractionPage — 런타임 로그 수집 모드
7. FeatureManagementPage — 3단계 프리셋 카드 + 토글
8. 프로젝트 설정 — 마이그레이션 범위 테이블 목록

---

## 디자인 노트

- **추천 스타일**: Swiss International (기업 발표) 또는 Bento Grid (기능 소개)
- **색상**: 인디고(#4338CA) 주색 + 흰색 배경 + 회색 보조
- **폰트**: 제목 Bold, 본문 Regular, 코드 Monospace
- **레이아웃**: 좌측 텍스트 + 우측 스크린샷 (50:50) 또는 Bento 그리드

---

## Appendix — 질문 대비 심화 자료

> 발표 본편(12장)에는 포함하지 않지만, Q&A 또는 후속 논의에서 꺼내 쓸 백업 슬라이드.
> 출처는 모두 `docs/` 하위 문서.

---

### Appendix A — 백엔드 상세 비교 (Slide 3 보충)
**출처**: `docs/01-backend-analysis.md` > §4 두 백엔드 비교 요약

| 항목 | OMA_Strands_Graph | strands-oracle-migration |
|------|-------------------|--------------------------|
| 역할 | DB/데이터 마이그레이션 | 앱(SQL) 마이그레이션 |
| 프레임워크 | FastAPI + Strands SDK | CLI only (HTTP API 없음) |
| 에이전트 수 | 9개 | 5개 |
| API | 11 REST + 1 WebSocket (25 이벤트) | 0 (FastAPI 래퍼 필요) |
| DB 접근 | Oracle + PostgreSQL 직접 | query_store 파일 시스템 |
| AI 모델 | Bedrock (Claude) via AgentCore | Bedrock (Claude) + sqlglot |

**예상 질문**: "두 백엔드를 왜 합치지 않나?"
→ 역할이 다름. DB 스키마 변환(DDL)과 앱 SQL 변환(DML)은 파이프라인이 분리. 단, ALB path-based routing으로 프론트에서는 하나처럼 보임.

---

### Appendix B — 갭 분석 전체 목록 (Slide 9 보충)
**출처**: `docs/03-gap-analysis.md` > GAP-00 ~ GAP-21

| GAP | 영역 | 요약 | 판단 | 우선순위 | 노력 |
|-----|------|------|------|:--------:|:----:|
| GAP-00 | 테이블 카탈로그 | Oracle 메타데이터 조회 API 3개 | 신규 추가 | P0 | 2일 |
| GAP-01 | 프로젝트 CRUD | 프로젝트 관리 6 endpoints | Mock 유지 (MVP) | P2 | 2일 |
| GAP-02 | 프로젝트 설정 | DB 접속/DMS/에이전트 설정 저장 | Mock 유지 (MVP) | P2 | 1일 |
| GAP-03 | 기능 토글 | 프리셋/플래그 저장 | Mock 유지 (MVP) | P2 | 1일 |
| GAP-04 | Dashboard 집계 | 진행률/메트릭/최근 태스크 | 신규 추가 | P0 | 2일 |
| GAP-05 | DMS 파이프라인 | 6단계 실행/상태 조회 | 기존 수정 | P0 | 4일 |
| GAP-06 | Assessment 결과 | 객체별 필터/정렬/요약 | 신규 추가 | P0 | 2일 |
| GAP-07 | AI 에이전트 | 파이프라인 상태/결과 실시간 | 기존 WS 활용 | P0 | 3일 |
| GAP-08 | 스키마 검증 | Oracle↔PG 비교 | 신규 추가 | P1 | 2일 |
| GAP-09 | 변환 컨텍스트 | 매핑 CRUD | 신규 추가 | P1 | 2일 |
| GAP-10 | **앱 마이그레이션 전체** | FastAPI 래퍼 24 endpoints | **전체 신규** | **P0** | **15일** |
| GAP-11 | 데이터 이관 | 실행/모니터링 API | 기존 활용 | P1 | 2일 |
| GAP-12 | 데이터 검증 | 비교 결과 API | 신규 추가 | P1 | 2일 |
| GAP-13~17 | 도구 5종 | SQL실행/로그/보고서/KB | 신규 추가 | P1~P2 | 7일 |
| GAP-18 | 실시간 스트리밍 | SSE 4 + WS 통합 | 기존 WS 확장 | P0 | 3일 |
| GAP-19~21 | 인프라/횡단 | CORS/인증/에러처리 | 신규 추가 | P1 | 3일 |

**합계**: P0 26일, P1 23일, P2 7일 → **총 56일 (약 11주, 2명 기준 ~7주)**

**예상 질문**: "왜 프로젝트 관리를 Mock으로 유지하나?"
→ MVP 단계에서는 단일 사용자 localStorage로 충분. 멀티유저/팀 협업 필요 시점에 DynamoDB + API로 전환.

---

### Appendix C — AI 에이전트 파이프라인 상세 (Slide 6 보충)
**출처**: `docs/01-backend-analysis.md` > §1.4 AI 에이전트 (9개)

**DB 마이그레이션 에이전트 (OMA_Strands_Graph):**

| 에이전트 | 역할 | UI 표시 |
|---------|------|:-------:|
| Discovery | 소스 DB 분석, 객체 탐색 | O |
| Schema Architect | DDL 변환 설계 | O |
| Code Migrator | PL/SQL → PL/pgSQL 변환 | O |
| QA Verifier | 변환 결과 검증 | O |
| Evaluator | GO/NO-GO 판정 (임계점수 기반) | O |
| Remediation | 실패 객체 재시도 | X (내부) |
| Report | 변환 보고서 생성 | X (내부) |
| Data Migrator | 데이터 복제 실행 | X (별도 페이지) |
| Data Verifier | 데이터 일치성 검증 | X (별도 페이지) |

**앱 마이그레이션 에이전트 (strands-oracle-migration):**

| 에이전트 | 역할 |
|---------|------|
| TranslatorAgent | sqlglot 기반 SQL 변환 + AI 폴백 |
| ValidatorAgent | EXPLAIN 검증 |
| ComparatorAgent | Oracle↔PG 결과 비교 |
| FixerAgent | 실패 SQL 자동 수정 |
| OrchestratorAgent | 전체 파이프라인 조율 |

**예상 질문**: "에이전트 리트라이 횟수는 어떻게 결정?"
→ 에이전트 설정 페이지에서 조정 (기본 3회). Evaluator 임계점수(기본 80) 미달 시 리트라이.

---

### Appendix D — 앱 마이그레이션 CLI→API 래핑 상세 (Slide 7, 10 보충)
**출처**: `docs/03-gap-analysis.md` > GAP-10

strands-oracle-migration은 CLI만 제공. 프론트엔드 연동을 위해 FastAPI 래퍼 신규 구축 필요:

| CLI 기능 | 래핑 API | 처리 방식 |
|---------|---------|----------|
| `extract_sql_from_xml()` | `POST /api/app/extraction/execute` | 동기 (< 30초) |
| `classify_sql()` | `POST /api/app/filtering/execute` | 동기 |
| `TranslatorAgent.run()` | `POST /api/app/rewrite/execute` | **SSE 스트리밍** (장시간) |
| `_merge_mapper_xmls()` | `POST /api/app/merge/execute` | 동기 |
| `compare_query_store()` | `POST /api/app/test/execute` | 동기 |

**장시간 작업 처리**: SSE(Server-Sent Events)로 진행률 스트리밍
```
POST /api/app/rewrite/execute
→ Content-Type: text/event-stream
→ data: {"progress": 45, "current": "SQL-042", "status": "converting"}
→ data: {"progress": 100, "status": "completed", "result": {...}}
```

**예상 질문**: "CLI를 왜 직접 subprocess로 안 부르나?"
→ subprocess는 상태 관리/에러 처리 어려움. FastAPI + Strands SDK로 래핑하면 비동기/스트리밍/재시도 패턴 표준화 가능.

---

### Appendix E — 아키텍처 의사결정 기록 (Slide 3 보충)
**출처**: `docs/03-gap-analysis.md` (기존 아키텍처 결정 반영)

**BFF(Backend For Frontend) vs 백엔드 직접 수정**

| 평가 기준 | BFF 방식 | 백엔드 직접 수정 (채택) |
|----------|---------|----------------------|
| 개발 속도 | 느림 (새 서비스 구축) | **빠름** (기존 코드에 추가) |
| 유지보수 | 3개 서비스 관리 | **2개 서비스** 유지 |
| 데이터 흐름 | 프론트→BFF→백엔드 (홉 추가) | **프론트→백엔드 직접** |
| 유연성 | BFF에서 응답 가공 가능 | 백엔드 API 설계에 의존 |
| 인프라 비용 | ECS 태스크 추가 | **추가 없음** |

**결론**: 현재 규모에서는 BFF 없이 ALB path-based routing으로 두 백엔드를 직접 호출. 프론트엔드 전용 endpoint가 필요한 경우 각 백엔드에 추가.

**예상 질문**: "나중에 BFF가 필요해지면?"
→ 프론트엔드 API 클라이언트(`src/lib/api/`)가 추상화 레이어 역할. BFF 도입 시 Base URL만 변경하면 됨.

---

### Appendix F — Oracle→PostgreSQL 변환 패턴 예시 (Slide 6-7 보충)
**출처**: `docs/01-backend-analysis.md` > §2.4 핵심 기능

AI 에이전트가 처리하는 대표적 Oracle 특화 구문 변환:

| Oracle 구문 | PostgreSQL 변환 | 복잡도 |
|------------|----------------|:------:|
| `NVL(a, b)` | `COALESCE(a, b)` | Low |
| `SYSDATE` | `CURRENT_TIMESTAMP` | Low |
| `ROWNUM <= n` | `LIMIT n` | Medium |
| `DECODE(a,b,c,d)` | `CASE WHEN a=b THEN c ELSE d END` | Medium |
| `CONNECT BY PRIOR` | `WITH RECURSIVE` CTE | High |
| `(+)` 아우터 조인 | `LEFT/RIGHT JOIN` | Medium |
| `DBMS_LOB` 패키지 | PostgreSQL Large Object API | High |
| `DBMS_SQL` 동적 커서 | `EXECUTE format()` | High |
| PL/SQL 패키지 | 스키마 + 함수 조합 | High |

**35+ Oracle 패턴 자동 감지** → sqlglot 결정론적 변환 우선, 실패 시 AI Agent 폴백

**예상 질문**: "변환 정확도는?"
→ Mock 데이터 기준 91.6% 자동 변환율. 나머지 8.4%는 AI Agent 리트라이로 약 80% 추가 변환 → 최종 약 98% 변환율 (수동 검토 2%).

---

### Appendix G — 인프라 구성도 (Slide 11 보충)
**출처**: `docs/04-integration-guide.md` > §1 통합 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   CloudFront / ALB                    │
│                                                       │
│  /                  → S3 (React SPA 정적 호스팅)     │
│  /api/db-*          → ECS:8000 (OMA_Strands_Graph)   │
│  /api/app-*         → ECS:8001 (strands-oracle-migration) │
│  /ws                → ECS:8000 (WebSocket)           │
└─────────────┬───────────────────┬────────────────────┘
              │                   │
    ┌─────────┴─────┐   ┌────────┴────────┐
    │ ECS Fargate   │   │ ECS Fargate     │
    │ :8000         │   │ :8001           │
    │ OMA_Strands   │   │ strands-oracle  │
    │ Graph         │   │ migration       │
    └───────┬───────┘   └────────┬────────┘
            │                    │
    ┌───────┴───────┐           │
    │ Bedrock       │   ┌───────┴───────┐
    │ (AgentCore)   │   │ Bedrock       │
    │ Claude Sonnet │   │ Claude Sonnet │
    └───────────────┘   └───────────────┘
            │
    ┌───────┴───────┐
    │ Oracle RDS    │ ← 소스
    │ PostgreSQL RDS│ ← 타겟
    │ DMS / S3      │ ← 아티팩트
    └───────────────┘
```

**예상 질문**: "ECS 대신 Lambda로 할 수 없나?"
→ AI 에이전트는 장시간 실행 (수 분~수십 분). Lambda 15분 제한에 걸림. ECS Fargate가 적합.

---

### Appendix 사용 가이드

| 질문 주제 | 참조 Appendix |
|----------|:------------:|
| 백엔드 2개 왜 분리? | A |
| 구체적으로 뭘 더 만들어야 해? | B |
| AI 에이전트가 정확히 뭘 하나? | C |
| CLI를 API로 어떻게 감싸? | D |
| BFF 안 쓰는 이유? | E |
| Oracle SQL이 어떻게 바뀌어? | F |
| 서버 인프라 구성은? | G |
