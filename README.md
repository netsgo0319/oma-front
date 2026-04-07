# OMA WebUI v2 — Oracle Modernization Accelerator

Oracle에서 PostgreSQL로의 마이그레이션 전 과정을 에이전트 기반으로 제어·추적·확인하는 통합 웹 플랫폼입니다.

---

## 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [사전 요구사항](#2-사전-요구사항)
3. [설치 및 실행](#3-설치-및-실행)
4. [초기 설정 가이드 (처음 사용자)](#4-초기-설정-가이드-처음-사용자)
5. [메뉴별 사용 가이드](#5-메뉴별-사용-가이드)
6. [설정 항목 상세](#6-설정-항목-상세)
7. [배포 가이드 (EC2 / ECS)](#7-배포-가이드-ec2--ecs)
8. [AWS DMS SC 연동 필수 값 점검](#8-aws-dms-sc-연동-필수-값-점검)
9. [트러블슈팅](#9-트러블슈팅)

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    OMA WebUI v2 (Frontend)                   │
│              EC2 / ECS에 배포 — React SPA                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Dashboard │  │DB Migr.  │  │App Migr. │  │Data Migr.│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐                                  │
│  │  Tools   │  │ Settings │                                  │
│  └──────────┘  └──────────┘                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST API (향후 백엔드 연동)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   OMA Backend / AgentCore                     │
│          AI 에이전트 실행, DMS API 호출, DB 접속              │
│                                                              │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ DMS SC    │  │ Bedrock  │  │ Oracle   │  │PostgreSQL │  │
│  │ API 호출  │  │ AI Agent │  │ Source   │  │ Target    │  │
│  └───────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**현재 상태**: 프론트엔드 데모 (Mock 데이터). 백엔드 연동 시 API 호출로 교체 예정.

---

## 2. 사전 요구사항

| 항목 | 최소 버전 | 비고 |
|------|----------|------|
| Node.js | 18.x LTS | 20.x LTS 권장 |
| npm | 9.x | Node.js에 포함 |
| 브라우저 | Chrome 90+ / Edge 90+ | 1280px 이상 해상도 |

### 프로덕션 배포 시 추가 요구사항

| 항목 | 설명 |
|------|------|
| AWS 계정 | DMS, Bedrock, S3 접근 가능한 계정 |
| Oracle DB | 소스 데이터베이스 (RDS Oracle 또는 On-Premises) |
| PostgreSQL DB | 타겟 데이터베이스 (RDS PostgreSQL 또는 Aurora) |
| AWS DMS | Schema Conversion 및 Data Migration용 |
| Amazon Bedrock | AI 에이전트 모델 호출용 (Claude) |
| EC2 또는 ECS | WebUI 및 AgentCore 배포 환경 |

---

## 3. 설치 및 실행

### 개발 모드

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 프로덕션 빌드

```bash
# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# dist/ 디렉토리를 웹 서버에 배포
```

---

## 4. 초기 설정 가이드 (처음 사용자)

서비스를 처음 사용할 때는 아래 순서대로 설정해야 합니다.

### Step 1: 프로젝트 설정 (`⚙️ 설정 > 프로젝트 설정`)

가장 먼저 설정해야 하는 페이지입니다.

| 순서 | 설정 항목 | 입력값 예시 | 설명 |
|------|----------|------------|------|
| 1-1 | **프로젝트 이름** | `고객사 ERP 마이그레이션` | 프로젝트 식별용 이름 |
| 1-2 | **OMA Base Path** | `/opt/oma` | OMA 엔진이 설치된 경로 (EC2/ECS 내부 경로) |
| 1-3 | **Application Source Path** | `/home/ec2-user/app-source` | 마이그레이션 대상 Java 소스코드 경로 |

### Step 2: 소스 DB (Oracle) 접속 정보

| 순서 | 설정 항목 | 입력값 예시 | 설명 |
|------|----------|------------|------|
| 2-1 | **Host** | `oracle-prod.xxx.ap-northeast-2.rds.amazonaws.com` | Oracle RDS 엔드포인트 또는 On-Prem IP |
| 2-2 | **Port** | `1521` | Oracle 리스너 포트 |
| 2-3 | **SID** | `ORCL` | Oracle SID (또는 Service Name) |
| 2-4 | **User** | `MIGRATION_USER` | 스키마 읽기 권한이 있는 사용자 |
| 2-5 | **Password** | `********` | 해당 사용자 비밀번호 |

> **"접속 테스트" 버튼**을 클릭하여 연결을 검증하세요.

### Step 3: 타겟 DB (PostgreSQL) 접속 정보

| 순서 | 설정 항목 | 입력값 예시 | 설명 |
|------|----------|------------|------|
| 3-1 | **Host** | `pg-target.xxx.ap-northeast-2.rds.amazonaws.com` | PostgreSQL RDS/Aurora 엔드포인트 |
| 3-2 | **Port** | `5432` | PostgreSQL 포트 |
| 3-3 | **Database** | `mydb` | 타겟 데이터베이스 이름 |
| 3-4 | **User** | `migration_user` | DDL 실행 권한이 있는 사용자 |
| 3-5 | **Password** | `********` | 해당 사용자 비밀번호 |

> **"접속 테스트" 버튼**을 클릭하여 연결을 검증하세요.

### Step 4: DMS 설정

| 순서 | 설정 항목 | 입력값 예시 | 설명 |
|------|----------|------------|------|
| 4-1 | **Replication Instance ARN** | `arn:aws:dms:ap-northeast-2:123456789012:rep:XXX` | DMS Replication Instance의 ARN |
| 4-2 | **S3 Bucket** | `my-migration-artifacts-bucket` | DDL 스크립트 내보내기용 S3 버킷 |

> **참고**: DMS SC가 S3에 DDL을 내보내므로, 해당 S3 버킷에 DMS가 쓰기 권한이 있어야 합니다.

### Step 5: 에이전트 설정 (`⚙️ 설정 > 에이전트 설정`)

| 순서 | 설정 항목 | 기본값 | 설명 |
|------|----------|--------|------|
| 5-1 | **Model ID** | `anthropic.claude-sonnet-4-20250514` | Amazon Bedrock에서 사용할 모델 ID |
| 5-2 | **Region** | `us-east-1` | Bedrock 모델이 활성화된 AWS 리전 |
| 5-3 | **Remediation 최대 재시도** | `3` | 스키마 변환 실패 시 AI 재시도 횟수 (1~10) |
| 5-4 | **Evaluator 임계점수** | `80` | GO/NO-GO 판정 기준 점수 (0~100) |
| 5-5 | **쿼리 재작성 최대 재시도** | `3` | SQL 변환 실패 시 재시도 횟수 (1~10) |
| 5-6 | **Context Budget** | `120000` | 에이전트 컨텍스트 윈도우 토큰 예산 |

### Step 6: 테스트 설정 (`⚙️ 설정 > 테스트 설정`)

| 순서 | 설정 항목 | 설명 |
|------|----------|------|
| 6-1 | **바인드 변수** | SQL 테스트 실행 시 사용할 파라미터 이름·타입·샘플값 등록 |
| 6-2 | **데이터 소스** | 테스트 데이터 종류 선택 (Oracle 샘플 / 합성 / 사용자 제공) |
| 6-3 | **AOP Log Path** | Spring AOP 에러 로그 수집 경로 지정 |

### 설정 완료 후 체크리스트

```
✅ 프로젝트 이름 및 경로 설정
✅ Oracle 소스 DB 접속 성공
✅ PostgreSQL 타겟 DB 접속 성공
✅ DMS Replication Instance ARN 입력
✅ S3 버킷 이름 입력
✅ AI 모델 ID 및 리전 설정
✅ 바인드 변수 최소 1개 이상 등록
→ 대시보드로 이동하여 마이그레이션 시작!
```

---

## 5. 메뉴별 사용 가이드

### 권장 작업 순서

```
① 설정 완료 (Step 1~6)
    ↓
② 대시보드에서 전체 현황 확인
    ↓
③ DB 마이그레이션
   3-1. DMS SC 실행 (6단계 파이프라인)
   3-2. DMS SC 결과 확인 (Assessment)
   3-3. AI 에이전트 스키마 변환 (잔여 객체)
   3-4. PostgreSQL 스키마 검증
   3-5. 변환 컨텍스트 관리
    ↓
④ 애플리케이션 마이그레이션
   4-1. Mapper 파일 탐색
   4-2. SQL 추출
   4-3. SQL 변환 대상 필터링
   4-4. 쿼리 재작성 (AI 에이전트)
   4-5. 변환 결과 수동 검수
   4-6. XML 병합
   4-7. 애플리케이션 테스트 지원
    ↓
⑤ 데이터 마이그레이션
   5-1. 데이터 이관 실행
   5-2. 데이터 검증
    ↓
⑥ 도구에서 보고서 생성 및 최종 확인
```

### 📊 대시보드

마이그레이션 전체 현황을 한눈에 파악합니다.
- **진행 현황 보드**: DB/앱/데이터 3대 영역 진행률
- **핵심 지표 카드**: 객체 변환율, SQL 변환율, 테스트 통과율, 데이터 이관율
- **실시간 작업 상태**: 현재 실행 중인 작업과 최근 완료 이력
- **워크플로우 다이어그램**: 각 노드 클릭 시 해당 메뉴로 바로 이동

### 🗄️ 데이터베이스 마이그레이션

| 서브 메뉴 | 설명 | 주요 기능 |
|----------|------|----------|
| DMS SC 실행 | DMS Schema Conversion 6단계 파이프라인 실행 | 단계별/일괄 실행, 로그 확인, 재실행 |
| DMS SC 결과 확인 | Assessment 보고서 및 변환 결과 확인 | 복잡도 분류, 트리아지 요약, 통계 차트 |
| AI 에이전트 스키마 변환 | DMS SC 실패 객체의 AI 자동 변환 | Oracle/PostgreSQL DDL 비교, GO/NO-GO 판정 |
| PostgreSQL 스키마 검증 | 변환 결과 1:1 대조 검증 | 누락/불일치 하이라이트 |
| 변환 컨텍스트 관리 | DB→앱 변환 정보 전달 | 스키마/패키지/데이터타입/DB Link 매핑 |

### 📱 애플리케이션 마이그레이션

| 서브 메뉴 | 설명 | 주요 기능 |
|----------|------|----------|
| Mapper 파일 탐색 | MyBatis XML Mapper 파일 탐색·분석 | 트리 뷰, SQL 통계, XML 미리보기 |
| SQL 추출 | Mapper에서 SQL 구문 추출 | 정적/동적 추출, CSV 다운로드 |
| SQL 변환 대상 필터링 | 재작성 필요 SQL 자동 식별 | 3분류 (변환 필요/신규/불필요) |
| 쿼리 재작성 | AI 에이전트 SQL 자동 변환 | Oracle↔PostgreSQL diff, 자동 재시도 |
| 수동 검수 | 변환 실패 SQL 수동 수정 | SQL 편집기, 구문 검증, 실행 비교 |
| XML 병합 | 변환 SQL을 원본 XML에 병합 | diff 비교, XML 유효성 검사 |
| 테스트 지원 | AOP 기반 에러 수집·자동 수정 | 에러 분류, 자동 수정 승인/반려 |

### 📦 데이터 마이그레이션

| 서브 메뉴 | 설명 |
|----------|------|
| 데이터 이관 실행 | DMS Full Load로 테이블별 데이터 이관, 진행률 표시 |
| 데이터 검증 | Oracle↔PostgreSQL 행 수 비교, 샘플 데이터 비교, PASS/FAIL 판정 |

### 🔧 도구

| 서브 메뉴 | 설명 |
|----------|------|
| SQL 실행기 | Oracle/PostgreSQL에 임의 SQL 실행, 양쪽 비교 모드 |
| 로그 뷰어 | 실시간 작업 로그, 레벨별 필터링 |
| 에이전트 로그 뷰어 | AI 에이전트 trajectory 확인, 도구 호출 이력 |
| 변환 보고서 | 종합 마이그레이션 보고서 자동 생성·다운로드 |
| 지식 베이스 | Oracle→PostgreSQL 변환 패턴 검색, 커스텀 규칙 관리 |

---

## 6. 설정 항목 상세

### 6.1 프로젝트 설정 — 전체 항목

| 섹션 | 필드 | 필수 | 설명 |
|------|------|:----:|------|
| **기본 정보** | 프로젝트 이름 | O | 프로젝트 식별자 |
| | OMA Base Path | O | OMA 엔진 설치 디렉토리 |
| | Application Source Path | O | MyBatis Mapper가 포함된 Java 소스 루트 |
| **소스 DB** | Host | O | Oracle RDS Endpoint 또는 IP |
| | Port | O | 기본값 1521 |
| | SID | O | Oracle SID 또는 Service Name |
| | User | O | `SELECT_CATALOG_ROLE` 이상 권한 필요 |
| | Password | O | 마스킹 저장 (`••••`) |
| **타겟 DB** | Host | O | PostgreSQL RDS/Aurora Endpoint |
| | Port | O | 기본값 5432 |
| | Database | O | 타겟 데이터베이스 이름 |
| | User | O | `CREATE`, `ALTER`, `DROP` 권한 필요 |
| | Password | O | 마스킹 저장 |
| **DMS** | Replication Instance ARN | O | DMS Replication Instance ARN |
| | S3 Bucket | O | DDL Export용 S3 버킷 이름 |

### 6.2 에이전트 설정

| 필드 | 필수 | 기본값 | 범위 | 설명 |
|------|:----:|--------|------|------|
| Model ID | O | `anthropic.claude-sonnet-4-20250514` | Bedrock 모델 ID | 스키마/쿼리 변환에 사용할 AI 모델 |
| Region | O | `us-east-1` | AWS 리전 코드 | Bedrock 모델이 활성화된 리전 |
| Remediation 최대 재시도 | - | 3 | 1~10 | 스키마 변환 실패 시 재시도 횟수 |
| Evaluator 임계점수 | - | 80 | 0~100 | 이 점수 미만이면 NO-GO 판정 |
| 쿼리 재작성 최대 재시도 | - | 3 | 1~10 | SQL 변환 실패 시 재시도 횟수 |
| Context Budget | - | 120,000 | tokens | 에이전트 컨텍스트 윈도우 제한 |

### 6.3 테스트 설정

| 탭 | 필드 | 설명 |
|----|------|------|
| **바인드 변수** | Name / Type / Sample Value | SQL 테스트 실행 시 바인드 파라미터 (예: `deptId`, `INTEGER`, `10`) |
| **데이터 소스** | Oracle 샘플 / 합성 / 사용자 제공 | 테스트용 데이터 공급 방식 |
| | JDBC URL | 테스트 DB 접속 URL |
| **AOP 설정** | Error Log Path | Spring AOP 에러 로그 수집 파일 경로 |
| | Storage Type | File System / S3 / CloudWatch Logs |

---

## 7. 배포 가이드 (EC2 / ECS)

### 7.1 EC2 배포

```bash
# 1. EC2 인스턴스에 Node.js 설치
sudo yum install -y nodejs npm    # Amazon Linux 2023
# 또는
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 2. 소스 코드 배포
cd /opt/oma/webui
git clone <repository-url> .

# 3. 빌드
npm install
npm run build

# 4. 정적 파일 서빙 (nginx 예시)
sudo yum install -y nginx
sudo cp -r dist/* /usr/share/nginx/html/

# 5. nginx SPA 설정 (/etc/nginx/conf.d/oma.conf)
cat << 'EOF' | sudo tee /etc/nginx/conf.d/oma.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo systemctl enable --now nginx
```

### 7.2 ECS (Fargate) 배포

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```nginx
# nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7.3 AgentCore 연동

WebUI는 프론트엔드 전용이며, 실제 에이전트 기능은 별도의 **AgentCore** 서비스에서 실행됩니다.

```
┌──────────┐     REST API      ┌──────────────┐
│ OMA      │ ◄──────────────► │  AgentCore   │
│ WebUI    │   (향후 연동)     │  (Backend)   │
│ (EC2/ECS)│                   │  (EC2/ECS)   │
└──────────┘                   └──────┬───────┘
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                   ┌──────────┐ ┌──────────┐ ┌──────────┐
                   │ AWS DMS  │ │ Bedrock  │ │ Oracle/  │
                   │ SC API   │ │ Claude   │ │ PG DBs   │
                   └──────────┘ └──────────┘ └──────────┘
```

AgentCore가 배포되면 WebUI의 API 호출 엔드포인트를 설정해야 합니다:

| 환경 변수 (향후) | 설명 | 예시 |
|-----------------|------|------|
| `VITE_API_BASE_URL` | AgentCore API 엔드포인트 | `http://agentcore.internal:8080/api` |
| `VITE_WS_URL` | 실시간 로그용 WebSocket | `ws://agentcore.internal:8080/ws` |

---

## 8. AWS DMS SC 연동 필수 값 점검

DMS Schema Conversion을 사용하려면 아래 항목이 모두 준비되어야 합니다.

### 현재 UI에서 설정 가능한 항목

| # | 항목 | UI 위치 | 상태 |
|---|------|---------|------|
| 1 | Oracle Host/Port/SID/User/Password | 설정 > 프로젝트 설정 > 소스 DB | ✅ 있음 |
| 2 | PostgreSQL Host/Port/DB/User/Password | 설정 > 프로젝트 설정 > 타겟 DB | ✅ 있음 |
| 3 | DMS Replication Instance ARN | 설정 > 프로젝트 설정 > DMS | ✅ 있음 |
| 4 | S3 Bucket (DDL Export) | 설정 > 프로젝트 설정 > DMS | ✅ 있음 |
| 5 | AI Model ID / Region | 설정 > 에이전트 설정 | ✅ 있음 |

### 인프라 배포(CDK/Terraform)에서 생성되는 항목

아래 항목들은 **CDK 또는 Terraform으로 인프라를 프로비저닝할 때** 자동 생성됩니다.  
생성된 ARN/설정값은 AgentCore 환경변수로 주입되거나, WebUI 설정 화면에 입력합니다.

```
CDK/Terraform 배포 → 리소스 생성 → Output으로 ARN 출력
                                        ↓
                         AgentCore 환경변수로 주입 + WebUI 설정에 입력
```

| # | 항목 | IaC 리소스 | 생성 후 전달 방식 |
|---|------|-----------|-----------------|
| 1 | **AWS Credentials** | `aws_iam_role` + Instance Profile / ECS Task Role | EC2/ECS에 자동 연결 (별도 입력 불필요) |
| 2 | **DMS Source Endpoint ARN** | `aws_dms_endpoint` (source) | AgentCore 환경변수 (`DMS_SOURCE_ENDPOINT_ARN`) |
| 3 | **DMS Target Endpoint ARN** | `aws_dms_endpoint` (target) | AgentCore 환경변수 (`DMS_TARGET_ENDPOINT_ARN`) |
| 4 | **DMS Migration Task ARN** | `aws_dms_replication_task` | AgentCore 환경변수 (`DMS_MIGRATION_TASK_ARN`) |
| 5 | **DMS SC Migration Project ARN** | DMS SC 콘솔에서 생성 (IaC 미지원 시 수동) | AgentCore 환경변수 (`DMS_SC_PROJECT_ARN`) |
| 6 | **IAM Role for DMS** | `aws_iam_role` (`dms-vpc-role`, `dms-cloudwatch-logs-role`) | DMS 서비스에 자동 연결 |
| 7 | **S3 Bucket + Policy** | `aws_s3_bucket` + `aws_s3_bucket_policy` | 버킷 이름을 WebUI 설정에 입력 |
| 8 | **VPC / Security Groups** | `aws_vpc`, `aws_security_group` | DMS/EC2/RDS에 자동 연결 |
| 9 | **Bedrock Model Access** | 1회성 수동 승인 (AWS Bedrock Console) | 승인 후 모델 ID를 WebUI 에이전트 설정에 입력 |
| 10 | **Oracle JDBC Driver** | AgentCore Docker 이미지 빌드 시 포함 | AgentCore 의존성 (ojdbc11.jar) |

### IAM 권한 요약

AgentCore가 실행되는 EC2/ECS에는 다음 IAM 권한이 필요합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DMSAccess",
      "Effect": "Allow",
      "Action": [
        "dms:DescribeReplicationInstances",
        "dms:DescribeEndpoints",
        "dms:DescribeReplicationTasks",
        "dms:StartReplicationTask",
        "dms:StopReplicationTask",
        "dms:TestConnection",
        "dms-sc:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-migration-artifacts-bucket",
        "arn:aws:s3:::my-migration-artifacts-bucket/*"
      ]
    },
    {
      "Sid": "BedrockAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*:*:foundation-model/*"
    }
  ]
}
```

### DMS SC 사전 설정 체크리스트

```
AWS 인프라:
  ✅ DMS Replication Instance 생성 완료
  ✅ DMS Source Endpoint (Oracle) 생성 및 테스트 통과
  ✅ DMS Target Endpoint (PostgreSQL) 생성 및 테스트 통과
  ✅ DMS SC Migration Project 생성 완료
  ✅ S3 버킷 생성 및 DMS 쓰기 권한 설정
  ✅ IAM Role 설정 (DMS, S3, Bedrock)
  ✅ VPC Security Group에서 Oracle(1521), PostgreSQL(5432) 포트 개방
  ✅ Bedrock에서 사용할 모델 접근 승인

OMA WebUI 설정:
  ✅ 소스 DB 접속 정보 입력 및 테스트 통과
  ✅ 타겟 DB 접속 정보 입력 및 테스트 통과
  ✅ DMS Replication Instance ARN 입력
  ✅ S3 Bucket 이름 입력
  ✅ AI Model ID 및 Region 설정
```

---

## 9. 트러블슈팅

### 빌드 실패

```bash
# TypeScript 에러 확인
npx tsc --noEmit

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 페이지 새로고침 시 404

SPA이므로 모든 경로를 `index.html`로 리다이렉트해야 합니다.

```nginx
# nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### CloudFront 경유 시 Vite 차단

`vite.config.ts`의 `server.allowedHosts`에 CloudFront 도메인을 추가하세요:

```ts
server: {
  host: '0.0.0.0',
  allowedHosts: ['your-distribution.cloudfront.net'],
}
```

### 다크/라이트 모드 전환

사이드바 하단의 🌙/☀️ 버튼으로 전환합니다. 설정은 브라우저 localStorage에 저장됩니다.

---

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.x | UI 프레임워크 |
| TypeScript | 5.x | 타입 안정성 |
| Vite | 8.x | 빌드 도구 |
| Tailwind CSS | 4.x | 스타일링 |
| React Router | 6.x | SPA 라우팅 |
| Recharts | 2.x | 차트 시각화 |
| Lucide React | - | 아이콘 |
