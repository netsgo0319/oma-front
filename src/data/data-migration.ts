// Data Migration mock data for OMA WebUI v2

export const migrationTables = [
  // HR schema
  { tableName: 'HR.EMPLOYEES', schema: 'HR', rowCount: 2341, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:00Z', duration: '12s' },
  { tableName: 'HR.DEPARTMENTS', schema: 'HR', rowCount: 27, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:12Z', duration: '1s' },
  { tableName: 'HR.JOB_HISTORY', schema: 'HR', rowCount: 15890, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:13Z', duration: '18s' },
  { tableName: 'HR.LOCATIONS', schema: 'HR', rowCount: 145, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:31Z', duration: '2s' },
  { tableName: 'HR.JOBS', schema: 'HR', rowCount: 52, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:33Z', duration: '1s' },
  { tableName: 'HR.ATTENDANCE', schema: 'HR', rowCount: 458923, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:34Z', duration: '3m 42s' },
  { tableName: 'HR.SALARY_HISTORY', schema: 'HR', rowCount: 34567, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:04:16Z', duration: '28s' },

  // SALES schema
  { tableName: 'SALES.CUSTOMERS', schema: 'SALES', rowCount: 125430, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:04:44Z', duration: '1m 35s' },
  { tableName: 'SALES.ORDERS', schema: 'SALES', rowCount: 2456789, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:06:19Z', duration: '18m 22s' },
  { tableName: 'SALES.ORDER_ITEMS', schema: 'SALES', rowCount: 8234102, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:24:41Z', duration: '45m 08s' },
  { tableName: 'SALES.PRODUCTS', schema: 'SALES', rowCount: 4523, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:09:49Z', duration: '5s' },
  { tableName: 'SALES.PRODUCT_CATEGORIES', schema: 'SALES', rowCount: 128, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:09:54Z', duration: '1s' },
  { tableName: 'SALES.PROMOTIONS', schema: 'SALES', rowCount: 892, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:09:55Z', duration: '2s' },
  { tableName: 'SALES.ORDER_RETURNS', schema: 'SALES', rowCount: 45123, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:09:57Z', duration: '38s' },
  { tableName: 'SALES.SHIPPING_INFO', schema: 'SALES', rowCount: 2340567, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:10:35Z', duration: '17m 12s' },

  // FIN schema
  { tableName: 'FIN.GL_JOURNAL_ENTRIES', schema: 'FIN', rowCount: 3456789, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:27:47Z', duration: '25m 41s' },
  { tableName: 'FIN.GL_ACCOUNTS', schema: 'FIN', rowCount: 1245, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:53:28Z', duration: '2s' },
  { tableName: 'FIN.GL_PERIODS', schema: 'FIN', rowCount: 96, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:53:30Z', duration: '1s' },
  { tableName: 'FIN.AP_INVOICES', schema: 'FIN', rowCount: 567890, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:53:31Z', duration: '4m 23s' },
  { tableName: 'FIN.AR_RECEIPTS', schema: 'FIN', rowCount: 345678, status: 'completed' as const, progress: 100, startTime: '2026-04-06T07:57:54Z', duration: '2m 56s' },
  { tableName: 'FIN.BUDGETS', schema: 'FIN', rowCount: 2340, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:00:50Z', duration: '3s' },
  { tableName: 'FIN.PAYMENTS', schema: 'FIN', rowCount: 234567, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:00:53Z', duration: '1m 58s' },

  // INV schema
  { tableName: 'INV.INVENTORY_ITEMS', schema: 'INV', rowCount: 12456, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:02:51Z', duration: '15s' },
  { tableName: 'INV.WAREHOUSE_STOCK', schema: 'INV', rowCount: 89234, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:03:06Z', duration: '1m 12s' },
  { tableName: 'INV.WAREHOUSES', schema: 'INV', rowCount: 34, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:04:18Z', duration: '1s' },
  { tableName: 'INV.STOCK_ADJUSTMENTS', schema: 'INV', rowCount: 156789, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:04:19Z', duration: '1m 28s' },
  { tableName: 'INV.STOCK_TRANSFERS', schema: 'INV', rowCount: 67890, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:05:47Z', duration: '52s' },
  { tableName: 'INV.PURCHASE_ORDERS', schema: 'INV', rowCount: 45678, status: 'completed' as const, progress: 100, startTime: '2026-04-06T08:06:39Z', duration: '38s' },

  // CRM schema
  { tableName: 'CRM.CONTACTS', schema: 'CRM', rowCount: 234567, status: 'running' as const, progress: 72, startTime: '2026-04-06T08:07:17Z' },
  { tableName: 'CRM.OPPORTUNITIES', schema: 'CRM', rowCount: 89012, status: 'running' as const, progress: 45, startTime: '2026-04-06T08:08:30Z' },
  { tableName: 'CRM.CAMPAIGNS', schema: 'CRM', rowCount: 1567, status: 'waiting' as const, progress: 0 },
  { tableName: 'CRM.CAMPAIGN_MEMBERS', schema: 'CRM', rowCount: 456789, status: 'waiting' as const, progress: 0 },
  { tableName: 'CRM.ACCOUNTS', schema: 'CRM', rowCount: 34567, status: 'waiting' as const, progress: 0 },
  { tableName: 'CRM.ACTIVITIES', schema: 'CRM', rowCount: 789012, status: 'waiting' as const, progress: 0 },

  // Common schema
  { tableName: 'COMMON.CODES', schema: 'COMMON', rowCount: 3456, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:00Z', duration: '4s' },
  { tableName: 'COMMON.CODE_GROUPS', schema: 'COMMON', rowCount: 89, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:04Z', duration: '1s' },
  { tableName: 'COMMON.SYSTEM_CONFIG', schema: 'COMMON', rowCount: 234, status: 'completed' as const, progress: 100, startTime: '2026-04-06T06:00:05Z', duration: '1s' },
  { tableName: 'COMMON.AUDIT_LOG', schema: 'COMMON', rowCount: 1234567, status: 'failed' as const, progress: 34, startTime: '2026-04-06T08:10:00Z', duration: '5m 12s' },
];

export const validationResults = [
  { tableName: 'HR.EMPLOYEES', oracleRowCount: 2341, postgresRowCount: 2341, match: true, sampleCheck: 'pass' as const },
  { tableName: 'HR.DEPARTMENTS', oracleRowCount: 27, postgresRowCount: 27, match: true, sampleCheck: 'pass' as const },
  { tableName: 'HR.JOB_HISTORY', oracleRowCount: 15890, postgresRowCount: 15890, match: true, sampleCheck: 'pass' as const },
  { tableName: 'HR.LOCATIONS', oracleRowCount: 145, postgresRowCount: 145, match: true, sampleCheck: 'pass' as const },
  { tableName: 'HR.JOBS', oracleRowCount: 52, postgresRowCount: 52, match: true, sampleCheck: 'pass' as const },
  { tableName: 'HR.ATTENDANCE', oracleRowCount: 458923, postgresRowCount: 458923, match: true, sampleCheck: 'pass' as const },
  { tableName: 'HR.SALARY_HISTORY', oracleRowCount: 34567, postgresRowCount: 34567, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.CUSTOMERS', oracleRowCount: 125430, postgresRowCount: 125430, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.ORDERS', oracleRowCount: 2456789, postgresRowCount: 2456789, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.ORDER_ITEMS', oracleRowCount: 8234102, postgresRowCount: 8234102, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.PRODUCTS', oracleRowCount: 4523, postgresRowCount: 4523, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.PRODUCT_CATEGORIES', oracleRowCount: 128, postgresRowCount: 128, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.PROMOTIONS', oracleRowCount: 892, postgresRowCount: 892, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.ORDER_RETURNS', oracleRowCount: 45123, postgresRowCount: 45123, match: true, sampleCheck: 'pass' as const },
  { tableName: 'SALES.SHIPPING_INFO', oracleRowCount: 2340567, postgresRowCount: 2340567, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.GL_JOURNAL_ENTRIES', oracleRowCount: 3456789, postgresRowCount: 3456789, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.GL_ACCOUNTS', oracleRowCount: 1245, postgresRowCount: 1245, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.GL_PERIODS', oracleRowCount: 96, postgresRowCount: 96, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.AP_INVOICES', oracleRowCount: 567890, postgresRowCount: 567890, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.AR_RECEIPTS', oracleRowCount: 345678, postgresRowCount: 345678, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.BUDGETS', oracleRowCount: 2340, postgresRowCount: 2340, match: true, sampleCheck: 'pass' as const },
  { tableName: 'FIN.PAYMENTS', oracleRowCount: 234567, postgresRowCount: 234567, match: true, sampleCheck: 'pass' as const },
  { tableName: 'INV.INVENTORY_ITEMS', oracleRowCount: 12456, postgresRowCount: 12456, match: true, sampleCheck: 'pass' as const },
  { tableName: 'INV.WAREHOUSE_STOCK', oracleRowCount: 89234, postgresRowCount: 89234, match: true, sampleCheck: 'pass' as const },
  { tableName: 'INV.WAREHOUSES', oracleRowCount: 34, postgresRowCount: 34, match: true, sampleCheck: 'pass' as const },
  { tableName: 'INV.STOCK_ADJUSTMENTS', oracleRowCount: 156789, postgresRowCount: 156789, match: true, sampleCheck: 'pass' as const },
  { tableName: 'INV.STOCK_TRANSFERS', oracleRowCount: 67890, postgresRowCount: 67890, match: true, sampleCheck: 'pass' as const },
  { tableName: 'INV.PURCHASE_ORDERS', oracleRowCount: 45678, postgresRowCount: 45678, match: true, sampleCheck: 'pass' as const },
  { tableName: 'CRM.CONTACTS', oracleRowCount: 234567, postgresRowCount: 168888, match: false, sampleCheck: 'pass' as const },
  { tableName: 'CRM.OPPORTUNITIES', oracleRowCount: 89012, postgresRowCount: 40055, match: false, sampleCheck: 'pass' as const },
  { tableName: 'COMMON.CODES', oracleRowCount: 3456, postgresRowCount: 3456, match: true, sampleCheck: 'pass' as const },
  { tableName: 'COMMON.CODE_GROUPS', oracleRowCount: 89, postgresRowCount: 89, match: true, sampleCheck: 'pass' as const },
  { tableName: 'COMMON.SYSTEM_CONFIG', oracleRowCount: 234, postgresRowCount: 234, match: true, sampleCheck: 'pass' as const },
  { tableName: 'COMMON.AUDIT_LOG', oracleRowCount: 1234567, postgresRowCount: 419753, match: false, sampleCheck: 'fail' as const, sequenceCheck: 'Sequence gap detected at row 419,754 - DMS task failed during transfer' },
];
