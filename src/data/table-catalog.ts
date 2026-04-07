// Oracle 소스 DB의 전체 테이블 카탈로그 (mock)
// 실제로는 DMS Pre-Assessment 또는 Oracle 메타데이터 쿼리로 조회

export interface CatalogTable {
  schema: string;
  tableName: string;
  fullName: string;
  rowCount: number;
  sizeMb: number;
  hasLob: boolean;
  hasTrigger: boolean;
}

export const tableCatalog: CatalogTable[] = [
  // HR schema (7 tables)
  { schema: 'HR', tableName: 'EMPLOYEES', fullName: 'HR.EMPLOYEES', rowCount: 2341, sizeMb: 1.2, hasLob: false, hasTrigger: true },
  { schema: 'HR', tableName: 'DEPARTMENTS', fullName: 'HR.DEPARTMENTS', rowCount: 27, sizeMb: 0.01, hasLob: false, hasTrigger: false },
  { schema: 'HR', tableName: 'JOB_HISTORY', fullName: 'HR.JOB_HISTORY', rowCount: 15890, sizeMb: 3.5, hasLob: false, hasTrigger: true },
  { schema: 'HR', tableName: 'LOCATIONS', fullName: 'HR.LOCATIONS', rowCount: 145, sizeMb: 0.02, hasLob: false, hasTrigger: false },
  { schema: 'HR', tableName: 'JOBS', fullName: 'HR.JOBS', rowCount: 52, sizeMb: 0.01, hasLob: false, hasTrigger: false },
  { schema: 'HR', tableName: 'ATTENDANCE', fullName: 'HR.ATTENDANCE', rowCount: 458923, sizeMb: 89.4, hasLob: false, hasTrigger: true },
  { schema: 'HR', tableName: 'SALARY_HISTORY', fullName: 'HR.SALARY_HISTORY', rowCount: 34567, sizeMb: 6.8, hasLob: false, hasTrigger: false },

  // SALES schema (8 tables)
  { schema: 'SALES', tableName: 'CUSTOMERS', fullName: 'SALES.CUSTOMERS', rowCount: 125430, sizeMb: 45.2, hasLob: false, hasTrigger: true },
  { schema: 'SALES', tableName: 'ORDERS', fullName: 'SALES.ORDERS', rowCount: 2456789, sizeMb: 512.0, hasLob: false, hasTrigger: true },
  { schema: 'SALES', tableName: 'ORDER_ITEMS', fullName: 'SALES.ORDER_ITEMS', rowCount: 8234102, sizeMb: 1240.0, hasLob: false, hasTrigger: false },
  { schema: 'SALES', tableName: 'PRODUCTS', fullName: 'SALES.PRODUCTS', rowCount: 4523, sizeMb: 2.1, hasLob: true, hasTrigger: false },
  { schema: 'SALES', tableName: 'PRODUCT_CATEGORIES', fullName: 'SALES.PRODUCT_CATEGORIES', rowCount: 128, sizeMb: 0.01, hasLob: false, hasTrigger: false },
  { schema: 'SALES', tableName: 'PROMOTIONS', fullName: 'SALES.PROMOTIONS', rowCount: 892, sizeMb: 0.3, hasLob: false, hasTrigger: false },
  { schema: 'SALES', tableName: 'ORDER_RETURNS', fullName: 'SALES.ORDER_RETURNS', rowCount: 45123, sizeMb: 12.4, hasLob: false, hasTrigger: true },
  { schema: 'SALES', tableName: 'SHIPPING_INFO', fullName: 'SALES.SHIPPING_INFO', rowCount: 2340567, sizeMb: 456.0, hasLob: false, hasTrigger: false },

  // FIN schema (7 tables)
  { schema: 'FIN', tableName: 'GL_JOURNAL_ENTRIES', fullName: 'FIN.GL_JOURNAL_ENTRIES', rowCount: 3456789, sizeMb: 890.0, hasLob: false, hasTrigger: true },
  { schema: 'FIN', tableName: 'GL_ACCOUNTS', fullName: 'FIN.GL_ACCOUNTS', rowCount: 1245, sizeMb: 0.5, hasLob: false, hasTrigger: false },
  { schema: 'FIN', tableName: 'GL_PERIODS', fullName: 'FIN.GL_PERIODS', rowCount: 96, sizeMb: 0.01, hasLob: false, hasTrigger: false },
  { schema: 'FIN', tableName: 'AP_INVOICES', fullName: 'FIN.AP_INVOICES', rowCount: 567890, sizeMb: 124.0, hasLob: true, hasTrigger: true },
  { schema: 'FIN', tableName: 'AR_RECEIPTS', fullName: 'FIN.AR_RECEIPTS', rowCount: 345678, sizeMb: 67.0, hasLob: false, hasTrigger: true },
  { schema: 'FIN', tableName: 'BUDGETS', fullName: 'FIN.BUDGETS', rowCount: 2340, sizeMb: 0.8, hasLob: false, hasTrigger: false },
  { schema: 'FIN', tableName: 'PAYMENTS', fullName: 'FIN.PAYMENTS', rowCount: 234567, sizeMb: 45.6, hasLob: false, hasTrigger: true },

  // INV schema (6 tables)
  { schema: 'INV', tableName: 'INVENTORY_ITEMS', fullName: 'INV.INVENTORY_ITEMS', rowCount: 12456, sizeMb: 3.4, hasLob: false, hasTrigger: false },
  { schema: 'INV', tableName: 'WAREHOUSE_STOCK', fullName: 'INV.WAREHOUSE_STOCK', rowCount: 89234, sizeMb: 18.9, hasLob: false, hasTrigger: true },
  { schema: 'INV', tableName: 'WAREHOUSES', fullName: 'INV.WAREHOUSES', rowCount: 34, sizeMb: 0.01, hasLob: false, hasTrigger: false },
  { schema: 'INV', tableName: 'STOCK_ADJUSTMENTS', fullName: 'INV.STOCK_ADJUSTMENTS', rowCount: 156789, sizeMb: 32.1, hasLob: false, hasTrigger: true },
  { schema: 'INV', tableName: 'STOCK_TRANSFERS', fullName: 'INV.STOCK_TRANSFERS', rowCount: 67890, sizeMb: 14.5, hasLob: false, hasTrigger: false },
  { schema: 'INV', tableName: 'PURCHASE_ORDERS', fullName: 'INV.PURCHASE_ORDERS', rowCount: 45678, sizeMb: 9.8, hasLob: false, hasTrigger: true },

  // CRM schema (6 tables)
  { schema: 'CRM', tableName: 'CONTACTS', fullName: 'CRM.CONTACTS', rowCount: 234567, sizeMb: 56.7, hasLob: false, hasTrigger: false },
  { schema: 'CRM', tableName: 'OPPORTUNITIES', fullName: 'CRM.OPPORTUNITIES', rowCount: 89012, sizeMb: 23.4, hasLob: false, hasTrigger: true },
  { schema: 'CRM', tableName: 'CAMPAIGNS', fullName: 'CRM.CAMPAIGNS', rowCount: 1567, sizeMb: 0.6, hasLob: false, hasTrigger: false },
  { schema: 'CRM', tableName: 'CAMPAIGN_MEMBERS', fullName: 'CRM.CAMPAIGN_MEMBERS', rowCount: 456789, sizeMb: 78.9, hasLob: false, hasTrigger: false },
  { schema: 'CRM', tableName: 'ACCOUNTS', fullName: 'CRM.ACCOUNTS', rowCount: 34567, sizeMb: 8.9, hasLob: false, hasTrigger: true },
  { schema: 'CRM', tableName: 'ACTIVITIES', fullName: 'CRM.ACTIVITIES', rowCount: 789012, sizeMb: 145.0, hasLob: true, hasTrigger: true },

  // COMMON schema (3 tables)
  { schema: 'COMMON', tableName: 'CODES', fullName: 'COMMON.CODES', rowCount: 3456, sizeMb: 0.8, hasLob: false, hasTrigger: false },
  { schema: 'COMMON', tableName: 'CODE_GROUPS', fullName: 'COMMON.CODE_GROUPS', rowCount: 89, sizeMb: 0.01, hasLob: false, hasTrigger: false },
  { schema: 'COMMON', tableName: 'SYSTEM_CONFIG', fullName: 'COMMON.SYSTEM_CONFIG', rowCount: 234, sizeMb: 0.1, hasLob: false, hasTrigger: false },
];

export function getSchemas(): string[] {
  return [...new Set(tableCatalog.map((t) => t.schema))];
}

export function getTablesBySchema(schema: string): CatalogTable[] {
  return tableCatalog.filter((t) => t.schema === schema);
}

export function getSchemaStats(schema: string) {
  const tables = getTablesBySchema(schema);
  return {
    tableCount: tables.length,
    totalRows: tables.reduce((sum, t) => sum + t.rowCount, 0),
    totalSizeMb: tables.reduce((sum, t) => sum + t.sizeMb, 0),
  };
}
