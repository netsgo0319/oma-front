// Core types for Project and Feature Toggle system

export type FeatureKey =
  | 'dashboard'
  | 'dmsExecution'
  | 'dmsResults'
  | 'aiSchema'
  | 'schemaValidation'
  | 'conversionContext'
  | 'sqlExtraction'
  | 'sqlFiltering'
  | 'queryRewrite'
  | 'manualReview'
  | 'mapperExplorer'
  | 'xmlMerge'
  | 'testSupport'
  | 'dataExecution'
  | 'dataValidation'
  | 'sqlExecutor'
  | 'logViewer'
  | 'agentLog'
  | 'conversionReport'
  | 'knowledgeBase'
  | 'dmsConfig'
  | 'advancedAgentSettings'
  | 'cloudStorageOptions';

export type FeaturePreset = 'basic' | 'standard' | 'advanced';

export type FeatureFlags = Record<FeatureKey, boolean>;

export type ProjectStatus = 'active' | 'archived' | 'paused';

export interface SourceDbConfig {
  host: string;
  port: number;
  sid: string;
  user: string;
  password: string;
}

export interface TargetDbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface DmsConfig {
  projectArn: string;
  s3Bucket: string;
}

export interface ProjectSettings {
  projectName: string;
  omaBasePath: string;
  appSourcePath: string;
  sourceDb: SourceDbConfig;
  targetDb: TargetDbConfig;
  dmsConfig: DmsConfig;
}

export interface AgentSettings {
  modelId: string;
  region: string;
  maxRemediationRetries: number;
  evaluatorThreshold: number;
  maxQueryRetries: number;
  contextBudget: number;
}

export interface TestSettings {
  bindVariables: Array<{ name: string; type: string; sampleValue: string }>;
  dataSource: string;
  aopLogPath: string;
}

export interface MigrationScope {
  mode: 'all' | 'schema' | 'table';
  selectedSchemas: string[];
  selectedTables: string[];
  description: string;
}

export interface MigrationProgress {
  dbMigration: { completed: number; total: number; percentage: number };
  appMigration: { completed: number; total: number; percentage: number };
  dataMigration: { completed: number; total: number; percentage: number };
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  featurePreset: FeaturePreset;
  featureFlags: FeatureFlags;
  migrationScope: MigrationScope;
  settings: {
    project: ProjectSettings;
    agent: AgentSettings;
    test: TestSettings;
  };
  migrationProgress: MigrationProgress;
}
