// Dashboard mock data for OMA WebUI v2

export const migrationProgress = {
  dbMigration: {
    completed: 927,
    total: 1012,
    percentage: 91.6,
  },
  appMigration: {
    completed: 1523,
    total: 1846,
    percentage: 82.5,
  },
  dataMigration: {
    completed: 156,
    total: 168,
    percentage: 92.9,
  },
};

export const recentTasks = [
  {
    id: 'task-001',
    name: 'Schema Assessment - HR Module',
    status: 'completed' as const,
    startTime: '2026-04-06T09:15:00Z',
    duration: '4m 23s',
    agent: 'Schema Architect',
  },
  {
    id: 'task-002',
    name: 'PL/SQL Conversion - PKG_ORDER_MGMT',
    status: 'running' as const,
    startTime: '2026-04-06T10:02:00Z',
    duration: '12m 47s',
    agent: 'Code Migrator',
  },
  {
    id: 'task-003',
    name: 'Data Migration - SALES.ORDER_ITEMS',
    status: 'running' as const,
    startTime: '2026-04-06T10:08:00Z',
    duration: '8m 12s',
  },
  {
    id: 'task-004',
    name: 'Query Rewrite - EmployeeMapper.xml',
    status: 'completed' as const,
    startTime: '2026-04-06T08:45:00Z',
    duration: '6m 51s',
    agent: 'Code Migrator',
  },
  {
    id: 'task-005',
    name: 'Validation - FIN.GL_JOURNAL_ENTRIES',
    status: 'failed' as const,
    startTime: '2026-04-06T09:30:00Z',
    duration: '2m 15s',
    agent: 'QA Verifier',
  },
  {
    id: 'task-006',
    name: 'Schema Conversion - INV Package',
    status: 'completed' as const,
    startTime: '2026-04-06T07:20:00Z',
    duration: '18m 04s',
    agent: 'Schema Architect',
  },
  {
    id: 'task-007',
    name: 'DMS Full Load - CUSTOMERS table',
    status: 'completed' as const,
    startTime: '2026-04-06T06:00:00Z',
    duration: '45m 22s',
  },
  {
    id: 'task-008',
    name: 'Query Rewrite - OrderMapper.xml',
    status: 'running' as const,
    startTime: '2026-04-06T10:12:00Z',
    duration: '3m 08s',
    agent: 'Code Migrator',
  },
  {
    id: 'task-009',
    name: 'Test Execution - HR Module Queries',
    status: 'completed' as const,
    startTime: '2026-04-06T08:00:00Z',
    duration: '11m 33s',
    agent: 'QA Verifier',
  },
  {
    id: 'task-010',
    name: 'PL/SQL Conversion - FN_CALC_TAX',
    status: 'failed' as const,
    startTime: '2026-04-06T09:55:00Z',
    duration: '5m 40s',
    agent: 'Code Migrator',
  },
];

export const metrics = {
  dbObjectConversion: {
    autoConverted: 847,
    agentConverted: 68,
    failed: 12,
  },
  sqlConversion: {
    completed: 1523,
    needsRewrite: 234,
    pending: 89,
  },
  testResults: {
    pass: 1680,
    fail: 43,
    skip: 23,
  },
  dataMigration: {
    completedTables: 156,
    totalRows: '24,523,891',
    verified: true,
  },
};

export const workflowSteps = [
  {
    id: 'step-1',
    name: 'DB Assessment',
    description: 'Oracle 스키마 분석 및 호환성 평가',
    status: 'completed' as const,
    phase: 'db-migration',
  },
  {
    id: 'step-2',
    name: 'Schema Conversion',
    description: 'DDL 자동 변환 및 에이전트 변환',
    status: 'completed' as const,
    phase: 'db-migration',
  },
  {
    id: 'step-3',
    name: 'Schema Validation',
    description: '변환된 스키마 검증 및 비교',
    status: 'completed' as const,
    phase: 'db-migration',
  },
  {
    id: 'step-4',
    name: 'SQL Extraction',
    description: 'MyBatis XML에서 SQL 추출',
    status: 'completed' as const,
    phase: 'app-migration',
  },
  {
    id: 'step-5',
    name: 'SQL Filtering',
    description: '변환 필요 SQL 분류',
    status: 'completed' as const,
    phase: 'app-migration',
  },
  {
    id: 'step-6',
    name: 'Query Rewrite',
    description: 'Oracle SQL → PostgreSQL 변환',
    status: 'running' as const,
    phase: 'app-migration',
  },
  {
    id: 'step-7',
    name: 'XML Merge',
    description: '변환된 SQL을 XML에 반영',
    status: 'pending' as const,
    phase: 'app-migration',
  },
  {
    id: 'step-8',
    name: 'Test & Fix',
    description: '변환 결과 테스트 및 오류 수정',
    status: 'pending' as const,
    phase: 'app-migration',
  },
  {
    id: 'step-9',
    name: 'Data Migration',
    description: 'AWS DMS를 통한 데이터 이관',
    status: 'running' as const,
    phase: 'data-migration',
  },
  {
    id: 'step-10',
    name: 'Data Validation',
    description: '데이터 정합성 검증',
    status: 'pending' as const,
    phase: 'data-migration',
  },
];
