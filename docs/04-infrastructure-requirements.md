# OMA WebUI v2 — Infrastructure Requirements

---

## 1. 전체 인프라 구성도

```
                     Internet
                        │
                   ┌────┴────┐
                   │CloudFront│  (HTTPS, CDN)
                   └────┬────┘
                        │
            ┌───────────┼───────────┐
            ▼                       ▼
  ┌──────────────────┐    ┌──────────────────┐
  │  S3 Bucket       │    │  ALB             │
  │  (WebUI Static)  │    │  (Backend API)   │
  │  dist/ 배포      │    │  :443 → :8000    │
  └──────────────────┘    └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼               ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │ ECS Fargate  │ │ ECS Fargate  │ │ ECS Fargate  │
          │ OMA_Strands  │ │ App Migr.    │ │ WebUI        │
          │ Graph :8000  │ │ Backend:TBD  │ │ (대안) :80   │
          └──────┬───────┘ └──────┬───────┘ └──────────────┘
                 │                │
     ┌───────────┼────────────────┼─────────────┐
     ▼           ▼                ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────┐
│ RDS     │ │ RDS     │ │ DMS          │ │ Bedrock  │
│ Oracle  │ │ Aurora  │ │ Replication  │ │ Claude   │
│ (Source)│ │ PG(Tgt) │ │ Instance     │ │          │
└─────────┘ └─────────┘ └──────────────┘ └──────────┘
     ▲           ▲
     └─────┬─────┘
     ┌─────┴─────┐
     │ VPC       │
     │ Private   │
     │ Subnets   │
     └───────────┘
```

---

## 2. 컴포넌트별 요구사항

### 2.1 WebUI (Frontend)

**배포 옵션 A: S3 + CloudFront (권장)**

| 항목 | 사양 |
|------|------|
| S3 Bucket | Static Website Hosting 활성화 |
| CloudFront | OAC (Origin Access Control) |
| SSL | ACM 인증서 (us-east-1 리전) |
| 캐시 | HTML: no-cache, JS/CSS: 1년 (hash 기반) |
| 비용 | 거의 무료 (정적 파일) |

**배포 옵션 B: ECS Fargate + nginx**

| 항목 | 사양 |
|------|------|
| CPU / Memory | 0.25 vCPU / 0.5 GB |
| Container | nginx:alpine + dist/ |
| Task 수 | 최소 1, 권장 2 (AZ 분산) |
| ALB | HTTPS → HTTP:80 |

### 2.2 OMA_Strands_Graph (DB/Data Migration Backend)

| 항목 | 사양 |
|------|------|
| Runtime | Python 3.11+ |
| CPU / Memory | 2 vCPU / 4 GB (최소), 4 vCPU / 8 GB (권장) |
| Container | Docker (Uvicorn 2 workers) |
| Port | 8000 |
| Health Check | `GET /api/health` |
| 환경변수 | DB 접속정보, AWS 자격증명, Bedrock 모델 ID 등 |

### 2.3 App Migration Backend (TBD)

| 항목 | 사양 (예상) |
|------|------|
| Runtime | TBD |
| CPU / Memory | TBD |
| Port | TBD |

### 2.4 데이터베이스

| DB | 서비스 | 사양 |
|----|--------|------|
| Oracle (소스) | RDS Oracle 또는 On-Premises | 고객 기존 환경 |
| PostgreSQL (타겟) | Aurora PostgreSQL 16.x | db.r6g.large 이상 |
| Redis | ElastiCache Redis | cache.t3.medium |
| DynamoDB | DynamoDB | On-demand 과금 |
| Neo4j | EC2 자체 호스팅 또는 Neo4j AuraDB | 선택적 |

### 2.5 AWS 관리형 서비스

| 서비스 | 용도 |
|--------|------|
| DMS Replication Instance | 스키마 변환 + 데이터 이관 |
| S3 | DDL 스크립트 저장, 보고서 저장, 로그 저장 |
| Bedrock | AI 에이전트 (Claude) 호출 |
| Secrets Manager | DB 비밀번호, API 키 저장 |
| CloudWatch | 로그 수집, 메트릭, 알람 |
| ACM | SSL/TLS 인증서 |

---

## 3. 네트워크 구성

### VPC 설계

```
VPC (10.0.0.0/16)
├── Public Subnets (10.0.1.0/24, 10.0.2.0/24)
│   ├── ALB (Backend)
│   └── NAT Gateway
├── Private Subnets (10.0.10.0/24, 10.0.11.0/24)
│   ├── ECS Tasks (Backend)
│   ├── RDS Oracle
│   ├── Aurora PostgreSQL
│   ├── ElastiCache Redis
│   └── DMS Replication Instance
└── Isolated Subnets (10.0.20.0/24, 10.0.21.0/24)
    └── (선택) 추가 보안 계층
```

### Security Group 규칙

| SG | Inbound | Source |
|----|---------|--------|
| ALB SG | 443 (HTTPS) | 0.0.0.0/0 |
| Backend SG | 8000 | ALB SG |
| Oracle SG | 1521 | Backend SG, DMS SG |
| PostgreSQL SG | 5432 | Backend SG, DMS SG |
| Redis SG | 6379 | Backend SG |
| DMS SG | - (outbound only) | - |

---

## 4. IAM 역할

### ECS Task Role (Backend)

```json
{
  "Statement": [
    {
      "Sid": "DMS",
      "Effect": "Allow",
      "Action": ["dms:*", "dms-sc:*"],
      "Resource": "*"
    },
    {
      "Sid": "S3",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::oma-*"]
    },
    {
      "Sid": "Bedrock",
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
      "Resource": "arn:aws:bedrock:*:*:foundation-model/*"
    },
    {
      "Sid": "SecretsManager",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:*:*:secret:oma-*"
    },
    {
      "Sid": "DynamoDB",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:Scan"],
      "Resource": "arn:aws:dynamodb:*:*:table/oma-*"
    },
    {
      "Sid": "CloudWatch",
      "Effect": "Allow",
      "Action": ["logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "*"
    }
  ]
}
```

---

## 5. CDK 스택 구조 (제안)

```
infra/
├── app.py                    # CDK App entry
├── stacks/
│   ├── network_stack.py      # VPC, Subnets, SGs
│   ├── database_stack.py     # RDS Oracle, Aurora PG, ElastiCache
│   ├── dms_stack.py          # DMS Replication Instance, Endpoints, Tasks
│   ├── backend_stack.py      # ECS Cluster, Task Def, Service (Strands Graph)
│   ├── app_backend_stack.py  # ECS Service (App Migration Backend)
│   ├── frontend_stack.py     # S3 + CloudFront (WebUI)
│   └── monitoring_stack.py   # CloudWatch Dashboards, Alarms
```

---

## 6. 환경 변수 목록

### WebUI (.env)

| 변수 | 설명 | 예시 |
|------|------|------|
| `VITE_API_BASE_URL` | DB/Data Migration API | `https://api.oma.example.com/api` |
| `VITE_APP_API_BASE_URL` | App Migration API | `https://app-api.oma.example.com/api` |
| `VITE_WS_URL` | WebSocket 엔드포인트 | `wss://api.oma.example.com/ws` |
| `VITE_USE_MOCK` | Mock 모드 토글 | `false` |

### Backend (ECS Task Environment)

| 변수 | 설명 |
|------|------|
| `OMA_ORACLE_HOST` | Oracle DB 호스트 |
| `OMA_ORACLE_PORT` | Oracle DB 포트 |
| `OMA_ORACLE_SID` | Oracle SID |
| `OMA_ORACLE_SECRET_ARN` | Secrets Manager ARN (user/password) |
| `OMA_POSTGRES_HOST` | PostgreSQL 호스트 |
| `OMA_POSTGRES_PORT` | PostgreSQL 포트 |
| `OMA_POSTGRES_DB` | PostgreSQL DB명 |
| `OMA_POSTGRES_SECRET_ARN` | Secrets Manager ARN |
| `OMA_DMS_REPLICATION_INSTANCE_ARN` | DMS Replication Instance |
| `OMA_DMS_SOURCE_ENDPOINT_ARN` | DMS Source Endpoint |
| `OMA_DMS_TARGET_ENDPOINT_ARN` | DMS Target Endpoint |
| `OMA_S3_BUCKET` | 아티팩트 저장 S3 버킷 |
| `OMA_BEDROCK_MODEL_ID` | Bedrock 모델 ID |
| `OMA_BEDROCK_REGION` | Bedrock 리전 |
| `OMA_REDIS_URL` | Redis 엔드포인트 |
| `OMA_DYNAMODB_TABLE_PREFIX` | DynamoDB 테이블 접두사 |
| `OMA_CORS_ORIGINS` | 허용 CORS 도메인 |
