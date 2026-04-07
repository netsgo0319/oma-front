import type { FeatureKey, FeaturePreset, FeatureFlags } from '@/types/project';

export interface FeatureDefinition {
  key: FeatureKey;
  labelKo: string;
  labelEn: string;
  description: string;
  category: 'db-migration' | 'app-migration' | 'data-migration' | 'tools' | 'settings';
  route?: string;
  isCore: boolean;
}

export const featureDefinitions: FeatureDefinition[] = [
  // Dashboard
  { key: 'dashboard', labelKo: '대시보드', labelEn: 'Dashboard', description: '마이그레이션 전체 진행 현황 및 워크플로우', category: 'tools', route: '/', isCore: false },

  // DB Migration
  { key: 'dmsExecution', labelKo: 'DMS SC 실행', labelEn: 'DMS Schema Conversion', description: 'AWS DMS Schema Conversion 파이프라인 실행', category: 'db-migration', route: '/db-migration/dms-execution', isCore: true },
  { key: 'dmsResults', labelKo: 'DMS SC 결과', labelEn: 'DMS Results', description: 'DMS 스키마 변환 평가 결과 조회', category: 'db-migration', route: '/db-migration/dms-results', isCore: true },
  { key: 'aiSchema', labelKo: 'AI 에이전트 스키마 변환', labelEn: 'AI Schema Conversion', description: 'DMS 실패 항목을 AI 에이전트로 자동 변환', category: 'db-migration', route: '/db-migration/ai-schema', isCore: true },
  { key: 'schemaValidation', labelKo: 'PostgreSQL 스키마 검증', labelEn: 'Schema Validation', description: 'Oracle↔PostgreSQL 스키마 비교 검증', category: 'db-migration', route: '/db-migration/schema-validation', isCore: true },
  { key: 'conversionContext', labelKo: '변환 컨텍스트 관리', labelEn: 'Conversion Context', description: '스키마/패키지/데이터타입/DB Link 매핑 관리', category: 'db-migration', route: '/db-migration/context', isCore: false },

  // App Migration
  { key: 'mapperExplorer', labelKo: 'Mapper 파일 탐색기', labelEn: 'Mapper Explorer', description: 'MyBatis XML Mapper 파일 구조 탐색', category: 'app-migration', route: '/app-migration/mapper-explorer', isCore: false },
  { key: 'sqlExtraction', labelKo: 'SQL 추출', labelEn: 'SQL Extraction', description: 'Mapper 파일에서 SQL 문 추출', category: 'app-migration', route: '/app-migration/sql-extraction', isCore: true },
  { key: 'sqlFiltering', labelKo: 'SQL 필터링', labelEn: 'SQL Filtering', description: 'Oracle 특화 SQL 분류 및 필터링', category: 'app-migration', route: '/app-migration/sql-filtering', isCore: true },
  { key: 'queryRewrite', labelKo: '쿼리 변환', labelEn: 'Query Rewrite', description: 'Oracle SQL을 PostgreSQL로 AI 자동 변환', category: 'app-migration', route: '/app-migration/query-rewrite', isCore: true },
  { key: 'manualReview', labelKo: '수동 검토', labelEn: 'Manual Review', description: '자동 변환 실패 항목 수동 수정', category: 'app-migration', route: '/app-migration/manual-review', isCore: false },
  { key: 'xmlMerge', labelKo: 'XML 병합', labelEn: 'XML Merge', description: '변환된 SQL을 원본 Mapper XML에 병합', category: 'app-migration', route: '/app-migration/xml-merge', isCore: true },
  { key: 'testSupport', labelKo: '테스트 지원', labelEn: 'Test Support', description: 'Spring AOP 기반 테스트 에러 수집 및 자동 수정', category: 'app-migration', route: '/app-migration/test-support', isCore: false },

  // Data Migration
  { key: 'dataExecution', labelKo: '데이터 마이그레이션 실행', labelEn: 'Data Migration', description: 'AWS DMS 기반 데이터 복제 실행 및 모니터링', category: 'data-migration', route: '/data-migration/execution', isCore: true },
  { key: 'dataValidation', labelKo: '데이터 검증', labelEn: 'Data Validation', description: 'Oracle↔PostgreSQL 데이터 일치성 검증', category: 'data-migration', route: '/data-migration/validation', isCore: true },

  // Tools
  { key: 'sqlExecutor', labelKo: 'SQL 실행기', labelEn: 'SQL Executor', description: '변환 후 검증용 SQL 실행 및 결과 비교', category: 'tools', route: '/tools/sql-executor', isCore: false },
  { key: 'logViewer', labelKo: '로그 뷰어', labelEn: 'Log Viewer', description: '시스템 로그 실시간 조회', category: 'tools', route: '/tools/log-viewer', isCore: false },
  { key: 'agentLog', labelKo: '에이전트 로그 뷰어', labelEn: 'Agent Log', description: 'AI 에이전트 실행 이력 및 추론 과정 조회', category: 'tools', route: '/tools/agent-log', isCore: false },
  { key: 'conversionReport', labelKo: '변환 보고서', labelEn: 'Conversion Report', description: '전체 변환 결과 종합 보고서', category: 'tools', route: '/tools/report', isCore: false },
  { key: 'knowledgeBase', labelKo: '지식 베이스', labelEn: 'Knowledge Base', description: 'Oracle→PostgreSQL 변환 패턴 및 규칙 검색', category: 'tools', route: '/tools/knowledge-base', isCore: false },

  // Settings (내부 토글 - 라우트 없음, 설정 페이지 내 섹션 제어)
  { key: 'dmsConfig', labelKo: 'DMS 설정', labelEn: 'DMS Configuration', description: 'AWS DMS Replication Instance 및 S3 설정', category: 'settings', isCore: false },
  { key: 'advancedAgentSettings', labelKo: '고급 에이전트 설정', labelEn: 'Advanced Agent Settings', description: 'Evaluator 임계점수, Context Budget 등 전문가 설정', category: 'settings', isCore: false },
  { key: 'cloudStorageOptions', labelKo: '클라우드 스토리지 옵션', labelEn: 'Cloud Storage Options', description: 'S3/CloudWatch Logs 기반 테스트 로그 저장', category: 'settings', isCore: false },
];

export const featurePresets: Record<FeaturePreset, FeatureFlags> = {
  basic: {
    dashboard: false,
    dmsExecution: true,
    dmsResults: true,
    aiSchema: true,
    schemaValidation: true,
    conversionContext: false,
    mapperExplorer: false,
    sqlExtraction: true,
    sqlFiltering: true,
    queryRewrite: true,
    manualReview: false,
    xmlMerge: true,
    testSupport: false,
    dataExecution: true,
    dataValidation: true,
    sqlExecutor: false,
    logViewer: false,
    agentLog: false,
    conversionReport: false,
    knowledgeBase: false,
    dmsConfig: false,
    advancedAgentSettings: false,
    cloudStorageOptions: false,
  },
  standard: {
    dashboard: true,
    dmsExecution: true,
    dmsResults: true,
    aiSchema: true,
    schemaValidation: true,
    conversionContext: false,
    mapperExplorer: true,
    sqlExtraction: true,
    sqlFiltering: true,
    queryRewrite: true,
    manualReview: true,
    xmlMerge: true,
    testSupport: true,
    dataExecution: true,
    dataValidation: true,
    sqlExecutor: true,
    logViewer: true,
    agentLog: false,
    conversionReport: true,
    knowledgeBase: true,
    dmsConfig: true,
    advancedAgentSettings: false,
    cloudStorageOptions: false,
  },
  advanced: {
    dashboard: true,
    dmsExecution: true,
    dmsResults: true,
    aiSchema: true,
    schemaValidation: true,
    conversionContext: true,
    mapperExplorer: true,
    sqlExtraction: true,
    sqlFiltering: true,
    queryRewrite: true,
    manualReview: true,
    xmlMerge: true,
    testSupport: true,
    dataExecution: true,
    dataValidation: true,
    sqlExecutor: true,
    logViewer: true,
    agentLog: true,
    conversionReport: true,
    knowledgeBase: true,
    dmsConfig: true,
    advancedAgentSettings: true,
    cloudStorageOptions: true,
  },
};

export function getFeatureDefinition(key: FeatureKey): FeatureDefinition | undefined {
  return featureDefinitions.find((f) => f.key === key);
}

export function getFeaturesByCategory(category: FeatureDefinition['category']): FeatureDefinition[] {
  return featureDefinitions.filter((f) => f.category === category);
}
