# OMA WebUI v2 — 미구현 항목 및 Gap 분석

---

## 1. 프론트엔드 미구현 항목

현재 **100% Mock 데이터**로 동작. 아래는 실제 연동 시 교체/구현해야 할 항목입니다.

### 1.1 API 연동 (전체 페이지)

| 페이지 | 현재 상태 | 필요 작업 |
|--------|----------|----------|
| 모든 페이지 | `src/data/*.ts`에서 정적 import | `src/lib/api.ts` 생성, fetch/axios로 교체 |
| 모든 설정 페이지 | "저장" 버튼이 `setTimeout`으로 시뮬레이션 | PUT API 호출로 교체 |
| 접속 테스트 | `setTimeout` 1500ms 후 "성공" | POST API 호출로 교체 |

### 1.2 실시간 기능 (WebSocket / SSE)

| 기능 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| DMS 파이프라인 로그 | 정적 로그 배열 표시 | SSE/WebSocket 로그 스트리밍 구현 |
| 에이전트 파이프라인 상태 | 정적 상태 표시 | WebSocket 이벤트로 실시간 상태 업데이트 |
| SQL 추출/재작성 진행률 | `setInterval`로 시뮬레이션 | SSE로 실제 진행률 수신 |
| 데이터 이관 진행률 | 정적 진행률 표시 | WebSocket으로 테이블별 실시간 갱신 |
| 대시보드 작업 상태 | 정적 테이블 | Polling 또는 SSE |
| 시스템 로그 | 정적 배열 | SSE 연속 스트리밍 |

### 1.3 파일 다운로드

| 기능 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| SQL 추출 CSV | 클라이언트에서 Mock 데이터로 Blob 생성 | 서버 API에서 CSV 다운로드 |
| 병합 XML 다운로드 | 템플릿 XML로 Blob 생성 | 서버에서 실제 병합 파일 다운로드 |
| 변환 보고서 다운로드 | onClick 핸들러 없음 | 서버 API에서 HTML/PDF 다운로드 |

### 1.4 인증/인가

| 항목 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| 로그인 | 없음 (자유 접근) | JWT 기반 로그인 페이지 + 토큰 관리 |
| 세션 관리 | 없음 | 토큰 갱신, 만료 시 리다이렉트 |
| 권한 분리 | 없음 | 역할별 메뉴 접근 제어 (향후 필요 시) |

### 1.5 에러 처리

| 항목 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| API 에러 | 없음 (Mock이라 에러 없음) | 글로벌 에러 핸들링, Toast 알림 |
| 네트워크 오프라인 | 미처리 | 오프라인 감지 + 재연결 UI |
| 타임아웃 | 미처리 | 요청 타임아웃 + 재시도 로직 |

---

## 2. OMA_Strands_Graph와의 Gap

### 2.1 API 구조 불일치

프론트엔드는 **페이지별 세분화된 69개 endpoint**를 기대하지만, OMA_Strands_Graph는 **마이그레이션 단위의 포괄적 11개 endpoint + WebSocket**을 제공합니다.

```
프론트엔드 기대:              백엔드 제공:
69개 세분화 REST              11개 포괄적 REST
+ 7개 스트림                 + 1개 WebSocket (25 이벤트)
```

### 2.2 해결 방안: BFF (Backend-for-Frontend) 패턴

```
Frontend  →  BFF Layer  →  OMA_Strands_Graph
(69 APIs)    (변환/집계)    (11 APIs + WebSocket)
```

**BFF가 하는 일:**
- 세분화된 API를 백엔드의 포괄적 API로 변환
- WebSocket 이벤트를 페이지별 데이터로 분배
- 마이그레이션 보고서에서 페이지별 필요 데이터 추출
- 설정 값 저장/조회 (Redis 또는 별도 DB)

**또는: 프론트엔드에서 직접 매핑**
- WebSocket 이벤트를 React Context/Store에서 분류
- `/api/migrations/{id}` 응답을 페이지별로 파싱
- 보고서 JSON에서 필요한 섹션만 추출

### 2.3 백엔드에 없는 기능 (추가 개발 필요)

| 기능 | 프론트엔드 요구 | OMA_Strands_Graph 상태 | 대응 방안 |
|------|----------------|----------------------|----------|
| **SQL 실행기** | 임의 SQL을 Oracle/PostgreSQL에 직접 실행 | 미제공 | BFF 또는 별도 SQL 실행 서비스 추가 |
| **변환 컨텍스트 편집** | 매핑 테이블 CRUD | 미제공 (읽기만 가능) | BFF + Redis/DynamoDB에 매핑 저장 |
| **지식 베이스 CRUD** | 패턴 검색/추가/수정/삭제 | DynamoDB에 패턴 저장하나 API 미노출 | 패턴 메모리 조회 API 추가 |
| **설정 저장소** | 프로젝트/에이전트/테스트 설정 영속화 | 환경변수 기반, 웹 설정 저장 미지원 | BFF + 설정 DB (DynamoDB 또는 PostgreSQL) |
| **DMS 6단계 세분화** | 6개 개별 단계 제어 | 전체를 1개 마이그레이션으로 실행 | WebSocket 이벤트에서 Phase 매핑으로 해결 가능 |

---

## 3. 앱 마이그레이션 Gap

> 앱 마이그레이션 백엔드 미전달 상태. 전달 후 업데이트 예정.

### 프론트엔드가 필요한 핵심 기능

| # | 기능 | 복잡도 | 설명 |
|---|------|:------:|------|
| 1 | MyBatis XML 파싱 | 높음 | resultMap, collection, sql/include, 동적 태그, OGNL 처리 |
| 2 | SQL 추출 (정적+동적) | 높음 | 동적 추출 시 SqlSessionFactory mock 실행 필요 |
| 3 | Oracle 고유 문법 판별 | 중간 | NVL, DECODE, SYSDATE, ROWNUM, CONNECT BY, MERGE 등 |
| 4 | AI 쿼리 재작성 | 높음 | Oracle→PostgreSQL 변환 + 테스트케이스 생성 + 자동 재시도 |
| 5 | Oracle/PG 양쪽 실행 비교 | 중간 | 동일 입력으로 양쪽 실행, 결과 diff |
| 6 | XML 병합 | 중간 | 변환 SQL을 원본 XML 구조에 재삽입, DTD 보존 |
| 7 | AOP 에러 로그 수집 | 낮음 | 파일/S3/CloudWatch에서 로그 파싱 |

### OMA_Strands_Graph의 앱 마이그레이션 관련 기능

OMA_Strands_Graph에는 이미 부분적으로 관련 기능이 있습니다:
- `POST /api/analyze/mybatis` — MyBatis XML 스캔
- `src/oma/tools/mybatis_tools.py` — MyBatis 파싱 도구
- `src/oma/orchestrator/sql_subgraph.py` — SQL 변환 서브그래프

**가능성**: 앱 마이그레이션 기능이 OMA_Strands_Graph에 이미 포함되어 있을 수 있음. 별도 백엔드가 아닌 동일 백엔드의 확장일 가능성도 고려.

---

## 4. 인프라 Gap

| 항목 | 현재 상태 | 필요 작업 |
|------|----------|----------|
| CORS 설정 | OMA_Strands_Graph: `localhost:3000,8000` | 프로덕션 도메인 추가 (`OMA_CORS_ORIGINS`) |
| CDK/Terraform | OMA_Strands_Graph `infra/`에 CDK 존재 | WebUI 배포 (S3+CloudFront 또는 ECS) 스택 추가 |
| SSL/TLS | 미설정 | ALB + ACM 인증서 또는 CloudFront HTTPS |
| 환경 분리 | 미분리 | dev/staging/prod 환경별 설정 |
| 모니터링 | 없음 | CloudWatch + X-Ray (백엔드), Sentry (프론트엔드) |

---

## 5. 우선순위 로드맵 제안

### Phase 1: 기본 연동 (MVP)

```
1. API Client Layer 구현 (src/lib/api.ts, src/lib/ws.ts)
2. 환경 변수 기반 Mock ↔ Real 전환
3. Dashboard ↔ OMA_Strands_Graph 연동
4. DB Migration 페이지 ↔ WebSocket 이벤트 연동
5. Settings 페이지 ↔ 설정 저장 API 연동
```

### Phase 2: 앱 마이그레이션

```
6. 앱 마이그레이션 백엔드 연동 (TBD)
7. SQL 추출/변환/병합 실시간 진행률
8. 수동 검수 SQL 편집기 ↔ 백엔드 구문 검증
```

### Phase 3: 도구 및 고도화

```
9.  SQL 실행기 ↔ 직접 DB 접속 API
10. 변환 보고서 생성/다운로드
11. 지식 베이스 CRUD
12. 인증/인가
13. 에러 핸들링 + 알림
```
