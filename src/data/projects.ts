import type { Project } from '@/types/project';
import { featurePresets } from './feature-definitions';
import { projectSettings, agentSettings, testSettings } from './settings';

export const seedProjects: Project[] = [
  {
    id: 'proj-demo',
    name: 'OMA 데모 시스템 마이그레이션',
    status: 'active',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-04-07T10:30:00Z',
    featurePreset: 'standard',
    featureFlags: { ...featurePresets.standard },
    migrationScope: {
      mode: 'schema',
      selectedSchemas: ['HR', 'SALES', 'FIN', 'INV', 'CRM', 'COMMON'],
      selectedTables: [],
      description: '전체 6개 스키마 (37 테이블)',
    },
    settings: {
      project: { ...projectSettings },
      agent: { ...agentSettings },
      test: { ...testSettings },
    },
    migrationProgress: {
      dbMigration: { completed: 847, total: 1234, percentage: 68.6 },
      appMigration: { completed: 156, total: 280, percentage: 55.7 },
      dataMigration: { completed: 12, total: 37, percentage: 32.4 },
    },
  },
  {
    id: 'proj-hr',
    name: 'HR 모듈 단독 마이그레이션',
    status: 'active',
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-04-07T08:00:00Z',
    featurePreset: 'basic',
    featureFlags: { ...featurePresets.basic },
    migrationScope: {
      mode: 'schema',
      selectedSchemas: ['HR'],
      selectedTables: [],
      description: 'HR 스키마 (7 테이블)',
    },
    settings: {
      project: {
        projectName: 'HR 모듈 마이그레이션',
        omaBasePath: '/opt/oma',
        appSourcePath: '/home/ec2-user/app-source/hr-module',
        sourceDb: {
          host: 'hr-oracle.cx5678efghij.ap-northeast-2.rds.amazonaws.com',
          port: 1521,
          sid: 'HRPROD',
          user: 'HR_MIGRATION',
          password: '••••••••••••',
        },
        targetDb: {
          host: 'hr-postgres.cx5678efghij.ap-northeast-2.rds.amazonaws.com',
          port: 5432,
          database: 'hrprod',
          user: 'hr_migration',
          password: '••••••••••••',
        },
        dmsConfig: {
          projectArn: '',
          s3Bucket: '',
        },
      },
      agent: { ...agentSettings },
      test: {
        bindVariables: [
          { name: 'empId', type: 'INTEGER', sampleValue: '100' },
          { name: 'deptId', type: 'INTEGER', sampleValue: '10' },
          { name: 'startDate', type: 'DATE', sampleValue: '2026-01-01' },
        ],
        dataSource: 'jdbc:postgresql://hr-postgres:5432/hrprod',
        aopLogPath: '/opt/oma/logs/hr-aop-test.log',
      },
    },
    migrationProgress: {
      dbMigration: { completed: 45, total: 120, percentage: 37.5 },
      appMigration: { completed: 0, total: 42, percentage: 0 },
      dataMigration: { completed: 0, total: 8, percentage: 0 },
    },
  },
];

let projectIdCounter = 3;

export function generateProjectId(): string {
  return `proj-${Date.now()}-${projectIdCounter++}`;
}
