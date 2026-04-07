// Shared workflow step definitions with route mappings

export interface WorkflowStep {
  id: number;
  name: string;
  route: string;
  phase: 'db' | 'app' | 'data';
}

export const workflowSteps: WorkflowStep[] = [
  { id: 1, name: 'DMS 스키마 변환', route: '/db-migration/dms-execution', phase: 'db' },
  { id: 2, name: 'DMS 결과 분석', route: '/db-migration/dms-results', phase: 'db' },
  { id: 3, name: 'AI 스키마 변환', route: '/db-migration/ai-schema', phase: 'db' },
  { id: 4, name: '스키마 검증', route: '/db-migration/schema-validation', phase: 'db' },
  { id: 5, name: 'SQL 추출', route: '/app-migration/sql-extraction', phase: 'app' },
  { id: 6, name: 'SQL 필터링', route: '/app-migration/sql-filtering', phase: 'app' },
  { id: 7, name: '쿼리 변환', route: '/app-migration/query-rewrite', phase: 'app' },
  { id: 8, name: 'XML 병합', route: '/app-migration/xml-merge', phase: 'app' },
  { id: 9, name: '데이터 마이그레이션', route: '/data-migration/execution', phase: 'data' },
  { id: 10, name: '데이터 검증', route: '/data-migration/validation', phase: 'data' },
];

export function getWorkflowStepByRoute(route: string): WorkflowStep | undefined {
  return workflowSteps.find((s) => s.route === route);
}

const phaseLabels: Record<string, string> = {
  db: 'DB 마이그레이션',
  app: '앱 마이그레이션',
  data: '데이터 마이그레이션',
};

export function getPhaseLabel(phase: string): string {
  return phaseLabels[phase] ?? phase;
}
