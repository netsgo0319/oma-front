// Settings mock data for OMA WebUI v2

export const projectSettings = {
  projectName: 'OMA 데모 시스템 마이그레이션',
  omaBasePath: '/opt/oma',
  appSourcePath: '/home/ec2-user/app-source/oma-erp',
  sourceDb: {
    host: 'oma-source.cx1234abcdef.ap-northeast-2.rds.amazonaws.com',
    port: 1521,
    sid: 'OMAPROD',
    user: 'OMA_MIGRATION',
    password: '••••••••••••',
  },
  targetDb: {
    host: 'oma-target.cx1234abcdef.ap-northeast-2.rds.amazonaws.com',
    port: 5432,
    database: 'omaprod',
    user: 'oma_migration',
    password: '••••••••••••',
  },
  dmsConfig: {
    projectArn: 'arn:aws:dms:ap-northeast-2:123456789012:replication-instance:oma-repl-instance-01',
    s3Bucket: 'oma-migration-artifacts-apne2',
  },
};

export const agentSettings = {
  modelId: 'anthropic.claude-sonnet-4-20250514',
  region: 'us-east-1',
  maxRemediationRetries: 3,
  evaluatorThreshold: 80,
  maxQueryRetries: 3,
  contextBudget: 120000,
};

export const testSettings = {
  bindVariables: [
    { name: 'deptId', type: 'INTEGER', sampleValue: '10' },
    { name: 'empId', type: 'INTEGER', sampleValue: '100' },
    { name: 'custId', type: 'INTEGER', sampleValue: '1001' },
    { name: 'orderId', type: 'INTEGER', sampleValue: '50001' },
    { name: 'status', type: 'VARCHAR', sampleValue: 'PENDING' },
    { name: 'startDate', type: 'DATE', sampleValue: '2025-01-01' },
    { name: 'endDate', type: 'DATE', sampleValue: '2025-12-31' },
    { name: 'region', type: 'VARCHAR', sampleValue: '서울' },
    { name: 'start', type: 'INTEGER', sampleValue: '1' },
    { name: 'end', type: 'INTEGER', sampleValue: '20' },
    { name: 'limit', type: 'INTEGER', sampleValue: '50' },
    { name: 'days', type: 'INTEGER', sampleValue: '30' },
    { name: 'months', type: 'INTEGER', sampleValue: '12' },
    { name: 'itemId', type: 'INTEGER', sampleValue: '5001' },
    { name: 'warehouseCode', type: 'VARCHAR', sampleValue: 'WH-SEL-01' },
    { name: 'quantity', type: 'INTEGER', sampleValue: '100' },
    { name: 'periodId', type: 'INTEGER', sampleValue: '202601' },
    { name: 'vendorId', type: 'INTEGER', sampleValue: '3001' },
    { name: 'categoryId', type: 'INTEGER', sampleValue: '10' },
    { name: 'accountId', type: 'INTEGER', sampleValue: '2001' },
  ],
  dataSource: 'jdbc:postgresql://oma-target.cx1234abcdef.ap-northeast-2.rds.amazonaws.com:5432/omaprod',
  aopLogPath: '/opt/oma/logs/aop-test-execution.log',
};
