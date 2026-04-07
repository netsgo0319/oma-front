// DB Migration mock data for OMA WebUI v2

export const dmsPipelineSteps = [
  {
    name: 'Pre-Assessment',
    description: 'Oracle 데이터베이스 호환성 사전 평가 및 SCT 분석',
    category: 'schema-conversion' as const,
    provenance: 'aws-dms' as const,
    status: 'completed' as const,
    duration: '12m 34s',
    logs: [
      '[INFO] Connecting to Oracle 19c (19.3.0.0) at oma-source.cx1234abcdef.ap-northeast-2.rds.amazonaws.com:1521/OMAPROD',
      '[INFO] Discovered 12 schemas, 168 tables, 47 packages, 89 procedures',
      '[INFO] SCT compatibility analysis complete: 91.6% auto-convertible',
      '[WARN] 12 objects require manual review (complex PL/SQL)',
      '[INFO] Pre-assessment report generated successfully',
    ],
  },
  {
    name: 'Schema Conversion',
    description: 'Oracle DDL → PostgreSQL DDL 자동 변환',
    category: 'schema-conversion' as const,
    provenance: 'aws-dms' as const,
    status: 'completed' as const,
    duration: '28m 17s',
    logs: [
      '[INFO] Starting schema conversion for 12 schemas',
      '[INFO] Converting tables: 168/168 completed',
      '[INFO] Converting indexes: 234/234 completed',
      '[INFO] Converting constraints: 312/312 completed',
      '[INFO] Converting sequences: 45/45 completed',
      '[WARN] 8 package bodies require agent-assisted conversion',
      '[INFO] Schema conversion complete: 927/1012 objects converted',
    ],
  },
  {
    name: 'Agent Remediation',
    description: 'AI 에이전트를 통한 실패 객체 변환 재시도',
    category: 'schema-conversion' as const,
    provenance: 'oma-enhanced' as const,
    status: 'completed' as const,
    duration: '45m 08s',
    logs: [
      '[INFO] Agent remediation started for 85 failed objects',
      '[INFO] Schema Architect analyzing PKG_ORDER_MGMT...',
      '[INFO] Code Migrator converting PROC_CALC_DISCOUNT → function calc_discount()',
      '[INFO] QA Verifier validating converted objects...',
      '[INFO] Evaluator score: 94/100 for PKG_ORDER_MGMT conversion',
      '[INFO] Agent remediation complete: 68/85 objects converted (80% success)',
      '[WARN] 12 objects marked for manual review',
    ],
  },
  {
    name: 'Schema Validation',
    description: '소스/타겟 스키마 비교 및 검증',
    category: 'schema-conversion' as const,
    provenance: 'oma-enhanced' as const,
    status: 'completed' as const,
    duration: '8m 52s',
    logs: [
      '[INFO] Starting schema validation between Oracle and PostgreSQL',
      '[INFO] Table count match: 168/168',
      '[INFO] Column count match: 2,847/2,851 (4 mismatched)',
      '[INFO] Index validation: 230/234 matched',
      '[WARN] 4 function-based indexes converted to expression indexes',
      '[INFO] Constraint validation: 312/312 matched',
      '[INFO] Schema validation complete',
    ],
  },
  {
    name: 'DMS Replication Setup',
    description: 'AWS DMS 복제 인스턴스 및 태스크 구성',
    category: 'data-replication' as const,
    provenance: 'aws-dms' as const,
    status: 'completed' as const,
    duration: '5m 21s',
    logs: [
      '[INFO] Creating DMS replication instance: oma-repl-instance-01',
      '[INFO] Instance class: dms.r5.2xlarge, allocated storage: 200GB',
      '[INFO] Creating source endpoint: oracle-source-ep',
      '[INFO] Creating target endpoint: postgresql-target-ep',
      '[INFO] Testing connections... Source: OK, Target: OK',
      '[INFO] Creating replication task: oma-full-load-cdc',
      '[INFO] DMS setup complete',
    ],
  },
  {
    name: 'Full Load & CDC',
    description: '전체 데이터 로드 및 변경 데이터 캡처',
    category: 'data-replication' as const,
    provenance: 'aws-dms' as const,
    status: 'running' as const,
    duration: '2h 14m',
    logs: [
      '[INFO] Starting full load for 168 tables',
      '[INFO] Loading HR schema: 12/12 tables completed (2,341,567 rows)',
      '[INFO] Loading SALES schema: 18/18 tables completed (8,234,102 rows)',
      '[INFO] Loading FIN schema: 15/15 tables completed (5,612,890 rows)',
      '[INFO] Loading INV schema: 22/22 tables completed (4,123,456 rows)',
      '[INFO] Loading CRM schema: 14/16 tables in progress...',
      '[INFO] CDC stream active: 1,247 changes captured',
      '[INFO] Current throughput: 12,450 rows/sec',
    ],
  },
];

export const assessmentResults = [
  { objectName: 'HR.EMPLOYEES', objectType: 'TABLE', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'HR.DEPARTMENTS', objectType: 'TABLE', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'HR.JOB_HISTORY', objectType: 'TABLE', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'HR.LOCATIONS', objectType: 'TABLE', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'SALES.ORDERS', objectType: 'TABLE', schema: 'SALES', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'SALES.ORDER_ITEMS', objectType: 'TABLE', schema: 'SALES', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'SALES.CUSTOMERS', objectType: 'TABLE', schema: 'SALES', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'SALES.PRODUCTS', objectType: 'TABLE', schema: 'SALES', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'FIN.GL_JOURNAL_ENTRIES', objectType: 'TABLE', schema: 'FIN', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'FIN.AP_INVOICES', objectType: 'TABLE', schema: 'FIN', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'FIN.AR_RECEIPTS', objectType: 'TABLE', schema: 'FIN', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'INV.INVENTORY_ITEMS', objectType: 'TABLE', schema: 'INV', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'INV.WAREHOUSE_STOCK', objectType: 'TABLE', schema: 'INV', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'CRM.CONTACTS', objectType: 'TABLE', schema: 'CRM', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'CRM.OPPORTUNITIES', objectType: 'TABLE', schema: 'CRM', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'PKG_ORDER_MGMT.PROC_CALC_TOTAL', objectType: 'PROCEDURE', schema: 'SALES', complexity: 'Complex' as const, status: 'Converted' as const },
  { objectName: 'PKG_ORDER_MGMT.PROC_APPLY_DISCOUNT', objectType: 'PROCEDURE', schema: 'SALES', complexity: 'Complex' as const, status: 'Converted' as const },
  { objectName: 'PKG_ORDER_MGMT.FN_GET_ORDER_STATUS', objectType: 'FUNCTION', schema: 'SALES', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'PKG_HR.PROC_HIRE_EMPLOYEE', objectType: 'PROCEDURE', schema: 'HR', complexity: 'Complex' as const, status: 'Converted' as const },
  { objectName: 'PKG_HR.PROC_TRANSFER_DEPT', objectType: 'PROCEDURE', schema: 'HR', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'PKG_HR.FN_CALC_SALARY', objectType: 'FUNCTION', schema: 'HR', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'PKG_FIN.PROC_CLOSE_PERIOD', objectType: 'PROCEDURE', schema: 'FIN', complexity: 'Complex' as const, status: 'Converted' as const },
  { objectName: 'PKG_FIN.PROC_GEN_TRIAL_BALANCE', objectType: 'PROCEDURE', schema: 'FIN', complexity: 'Complex' as const, status: 'Converted' as const },
  { objectName: 'PKG_FIN.FN_CALC_TAX', objectType: 'FUNCTION', schema: 'FIN', complexity: 'Complex' as const, status: 'Failed' as const, failureReason: 'DBMS_SQL dynamic cursor not supported in auto-conversion' },
  { objectName: 'PKG_INV.PROC_ADJUST_STOCK', objectType: 'PROCEDURE', schema: 'INV', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'PKG_INV.FN_CHECK_AVAILABILITY', objectType: 'FUNCTION', schema: 'INV', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'TRG_ORDERS_AUDIT', objectType: 'TRIGGER', schema: 'SALES', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'TRG_EMPLOYEE_HISTORY', objectType: 'TRIGGER', schema: 'HR', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'VW_EMPLOYEE_DETAILS', objectType: 'VIEW', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'VW_ORDER_SUMMARY', objectType: 'VIEW', schema: 'SALES', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'VW_GL_BALANCE_SHEET', objectType: 'VIEW', schema: 'FIN', complexity: 'Complex' as const, status: 'Failed' as const, failureReason: 'CONNECT BY hierarchical query in view definition' },
  { objectName: 'MV_SALES_MONTHLY', objectType: 'MATERIALIZED VIEW', schema: 'SALES', complexity: 'Complex' as const, status: 'Converted' as const },
  { objectName: 'SEQ_ORDER_ID', objectType: 'SEQUENCE', schema: 'SALES', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'SEQ_EMPLOYEE_ID', objectType: 'SEQUENCE', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'IDX_ORDERS_CUST_DATE', objectType: 'INDEX', schema: 'SALES', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'IDX_EMP_DEPT_ID', objectType: 'INDEX', schema: 'HR', complexity: 'Simple' as const, status: 'Converted' as const },
  { objectName: 'DBLINK_LEGACY_SYSTEM', objectType: 'DATABASE LINK', schema: 'PUBLIC', complexity: 'Complex' as const, status: 'Failed' as const, failureReason: 'Database link requires FDW (Foreign Data Wrapper) configuration' },
  { objectName: 'TYPE_ADDRESS_REC', objectType: 'TYPE', schema: 'HR', complexity: 'Medium' as const, status: 'Converted' as const },
  { objectName: 'TYPE_ORDER_LINE_TAB', objectType: 'TYPE', schema: 'SALES', complexity: 'Complex' as const, status: 'Failed' as const, failureReason: 'Nested TABLE type with MEMBER functions not auto-convertible' },
  { objectName: 'JOB_NIGHTLY_BATCH', objectType: 'DBMS_SCHEDULER JOB', schema: 'SYS', complexity: 'Complex' as const, status: 'Pending' as const },
];

export const agentPipeline = {
  steps: [
    {
      name: 'Discovery',
      status: 'completed' as const,
      duration: '3m 12s',
      description: '실패 객체 분석 및 변환 전략 수립',
      objectsProcessed: 85,
    },
    {
      name: 'Schema Architect',
      status: 'completed' as const,
      duration: '15m 45s',
      description: '스키마 구조 재설계 및 매핑 생성',
      objectsProcessed: 85,
    },
    {
      name: 'Code Migrator',
      status: 'completed' as const,
      duration: '18m 22s',
      description: 'PL/SQL → PL/pgSQL 코드 변환',
      objectsProcessed: 73,
    },
    {
      name: 'QA Verifier',
      status: 'running' as const,
      duration: '8m 30s',
      description: '변환 결과 검증 및 테스트 실행',
      objectsProcessed: 48,
    },
    {
      name: 'Evaluator',
      status: 'pending' as const,
      duration: '-',
      description: '변환 품질 평가 및 점수 산정',
      objectsProcessed: 0,
    },
  ],
};

export const schemaConversions = [
  {
    objectName: 'HR.EMPLOYEES',
    objectType: 'TABLE',
    oracleDDL: `CREATE TABLE HR.EMPLOYEES (
  EMPLOYEE_ID    NUMBER(6) NOT NULL,
  FIRST_NAME     VARCHAR2(20),
  LAST_NAME      VARCHAR2(25) NOT NULL,
  EMAIL          VARCHAR2(25) NOT NULL,
  PHONE_NUMBER   VARCHAR2(20),
  HIRE_DATE      DATE NOT NULL,
  JOB_ID         VARCHAR2(10) NOT NULL,
  SALARY         NUMBER(8,2),
  COMMISSION_PCT NUMBER(2,2),
  MANAGER_ID     NUMBER(6),
  DEPARTMENT_ID  NUMBER(4),
  CONSTRAINT EMP_PK PRIMARY KEY (EMPLOYEE_ID),
  CONSTRAINT EMP_EMAIL_UK UNIQUE (EMAIL),
  CONSTRAINT EMP_SALARY_CK CHECK (SALARY > 0)
);`,
    postgresqlDDL: `CREATE TABLE hr.employees (
  employee_id    INTEGER NOT NULL,
  first_name     VARCHAR(20),
  last_name      VARCHAR(25) NOT NULL,
  email          VARCHAR(25) NOT NULL,
  phone_number   VARCHAR(20),
  hire_date      DATE NOT NULL,
  job_id         VARCHAR(10) NOT NULL,
  salary         NUMERIC(8,2),
  commission_pct NUMERIC(2,2),
  manager_id     INTEGER,
  department_id  SMALLINT,
  CONSTRAINT emp_pk PRIMARY KEY (employee_id),
  CONSTRAINT emp_email_uk UNIQUE (email),
  CONSTRAINT emp_salary_ck CHECK (salary > 0)
);`,
    score: 100,
    rules: ['NUMBER→INTEGER/NUMERIC', 'VARCHAR2→VARCHAR', 'lowercase identifiers'],
    remediationHistory: [],
  },
  {
    objectName: 'PKG_ORDER_MGMT.PROC_CALC_TOTAL',
    objectType: 'PROCEDURE',
    oracleDDL: `CREATE OR REPLACE PROCEDURE PKG_ORDER_MGMT.PROC_CALC_TOTAL(
  p_order_id IN NUMBER,
  p_total    OUT NUMBER
) AS
  v_subtotal NUMBER := 0;
  v_tax_rate NUMBER := 0.1;
BEGIN
  SELECT NVL(SUM(quantity * unit_price), 0)
  INTO v_subtotal
  FROM SALES.ORDER_ITEMS
  WHERE order_id = p_order_id;

  p_total := v_subtotal + (v_subtotal * v_tax_rate);

  UPDATE SALES.ORDERS
  SET total_amount = p_total,
      updated_date = SYSDATE
  WHERE order_id = p_order_id;

  COMMIT;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    p_total := 0;
    DBMS_OUTPUT.PUT_LINE('Order not found: ' || p_order_id);
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE;
END PROC_CALC_TOTAL;`,
    postgresqlDDL: `CREATE OR REPLACE FUNCTION sales.calc_total(
  p_order_id INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  v_subtotal NUMERIC := 0;
  v_tax_rate NUMERIC := 0.1;
  v_total    NUMERIC;
BEGIN
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  INTO v_subtotal
  FROM sales.order_items
  WHERE order_id = p_order_id;

  v_total := v_subtotal + (v_subtotal * v_tax_rate);

  UPDATE sales.orders
  SET total_amount = v_total,
      updated_date = CURRENT_TIMESTAMP
  WHERE order_id = p_order_id;

  RETURN v_total;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 0;
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;`,
    score: 95,
    rules: ['OUT param→RETURNS', 'NVL→COALESCE', 'SYSDATE→CURRENT_TIMESTAMP', 'DBMS_OUTPUT removed', 'Package→Schema function'],
    remediationHistory: [
      { attempt: 1, changes: 'Initial SCT conversion - COMMIT/ROLLBACK handling incorrect', score: 72 },
      { attempt: 2, changes: 'Agent removed explicit COMMIT, fixed exception handling', score: 95 },
    ],
  },
  {
    objectName: 'PKG_HR.FN_CALC_SALARY',
    objectType: 'FUNCTION',
    oracleDDL: `CREATE OR REPLACE FUNCTION PKG_HR.FN_CALC_SALARY(
  p_employee_id IN NUMBER,
  p_bonus_pct   IN NUMBER DEFAULT 0
) RETURN NUMBER
IS
  v_base_salary  NUMBER;
  v_commission   NUMBER;
  v_total        NUMBER;
BEGIN
  SELECT salary, NVL(commission_pct, 0)
  INTO v_base_salary, v_commission
  FROM HR.EMPLOYEES
  WHERE employee_id = p_employee_id;

  v_total := v_base_salary * (1 + v_commission + NVL(p_bonus_pct, 0));

  RETURN ROUND(v_total, 2);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_CALC_SALARY;`,
    postgresqlDDL: `CREATE OR REPLACE FUNCTION hr.calc_salary(
  p_employee_id INTEGER,
  p_bonus_pct   NUMERIC DEFAULT 0
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_salary  NUMERIC;
  v_commission   NUMERIC;
  v_total        NUMERIC;
BEGIN
  SELECT salary, COALESCE(commission_pct, 0)
  INTO v_base_salary, v_commission
  FROM hr.employees
  WHERE employee_id = p_employee_id;

  v_total := v_base_salary * (1 + v_commission + COALESCE(p_bonus_pct, 0));

  RETURN ROUND(v_total, 2);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END;
$$;`,
    score: 98,
    rules: ['RETURN→RETURNS', 'IS→AS $$', 'NVL→COALESCE', 'Package→Schema function'],
    remediationHistory: [],
  },
  {
    objectName: 'SALES.ORDERS',
    objectType: 'TABLE',
    oracleDDL: `CREATE TABLE SALES.ORDERS (
  ORDER_ID       NUMBER(10) NOT NULL,
  CUSTOMER_ID    NUMBER(10) NOT NULL,
  ORDER_DATE     DATE DEFAULT SYSDATE,
  STATUS         VARCHAR2(20) DEFAULT 'PENDING',
  TOTAL_AMOUNT   NUMBER(12,2),
  CURRENCY_CODE  VARCHAR2(3) DEFAULT 'KRW',
  SHIPPING_ADDR  VARCHAR2(500),
  CREATED_BY     VARCHAR2(30),
  CREATED_DATE   DATE DEFAULT SYSDATE,
  UPDATED_DATE   DATE,
  CONSTRAINT ORD_PK PRIMARY KEY (ORDER_ID),
  CONSTRAINT ORD_CUST_FK FOREIGN KEY (CUSTOMER_ID)
    REFERENCES SALES.CUSTOMERS(CUSTOMER_ID)
);

CREATE INDEX SALES.IDX_ORD_CUST ON SALES.ORDERS(CUSTOMER_ID);
CREATE INDEX SALES.IDX_ORD_DATE ON SALES.ORDERS(ORDER_DATE);`,
    postgresqlDDL: `CREATE TABLE sales.orders (
  order_id       BIGINT NOT NULL,
  customer_id    BIGINT NOT NULL,
  order_date     DATE DEFAULT CURRENT_DATE,
  status         VARCHAR(20) DEFAULT 'PENDING',
  total_amount   NUMERIC(12,2),
  currency_code  VARCHAR(3) DEFAULT 'KRW',
  shipping_addr  VARCHAR(500),
  created_by     VARCHAR(30),
  created_date   DATE DEFAULT CURRENT_DATE,
  updated_date   DATE,
  CONSTRAINT ord_pk PRIMARY KEY (order_id),
  CONSTRAINT ord_cust_fk FOREIGN KEY (customer_id)
    REFERENCES sales.customers(customer_id)
);

CREATE INDEX idx_ord_cust ON sales.orders(customer_id);
CREATE INDEX idx_ord_date ON sales.orders(order_date);`,
    score: 100,
    rules: ['NUMBER(10)→BIGINT', 'SYSDATE→CURRENT_DATE', 'VARCHAR2→VARCHAR', 'lowercase identifiers'],
    remediationHistory: [],
  },
  {
    objectName: 'TRG_ORDERS_AUDIT',
    objectType: 'TRIGGER',
    oracleDDL: `CREATE OR REPLACE TRIGGER SALES.TRG_ORDERS_AUDIT
AFTER INSERT OR UPDATE OR DELETE ON SALES.ORDERS
FOR EACH ROW
DECLARE
  v_action VARCHAR2(10);
BEGIN
  IF INSERTING THEN v_action := 'INSERT';
  ELSIF UPDATING THEN v_action := 'UPDATE';
  ELSIF DELETING THEN v_action := 'DELETE';
  END IF;

  INSERT INTO SALES.ORDERS_AUDIT (
    audit_id, order_id, action, action_date, action_by
  ) VALUES (
    SEQ_AUDIT_ID.NEXTVAL,
    NVL(:NEW.order_id, :OLD.order_id),
    v_action,
    SYSDATE,
    USER
  );
END;`,
    postgresqlDDL: `CREATE OR REPLACE FUNCTION sales.fn_orders_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_action VARCHAR(10);
BEGIN
  IF TG_OP = 'INSERT' THEN v_action := 'INSERT';
  ELSIF TG_OP = 'UPDATE' THEN v_action := 'UPDATE';
  ELSIF TG_OP = 'DELETE' THEN v_action := 'DELETE';
  END IF;

  INSERT INTO sales.orders_audit (
    audit_id, order_id, action, action_date, action_by
  ) VALUES (
    nextval('sales.seq_audit_id'),
    COALESCE(NEW.order_id, OLD.order_id),
    v_action,
    CURRENT_TIMESTAMP,
    current_user
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_orders_audit
AFTER INSERT OR UPDATE OR DELETE ON sales.orders
FOR EACH ROW EXECUTE FUNCTION sales.fn_orders_audit();`,
    score: 92,
    rules: ['Trigger body→Function+Trigger', 'INSERTING→TG_OP', ':NEW/:OLD→NEW/OLD', 'NEXTVAL→nextval()', 'SYSDATE→CURRENT_TIMESTAMP', 'USER→current_user'],
    remediationHistory: [
      { attempt: 1, changes: 'Initial conversion missed TG_OP pattern', score: 65 },
      { attempt: 2, changes: 'Fixed trigger function pattern, added RETURN NULL', score: 92 },
    ],
  },
  {
    objectName: 'VW_ORDER_SUMMARY',
    objectType: 'VIEW',
    oracleDDL: `CREATE OR REPLACE VIEW SALES.VW_ORDER_SUMMARY AS
SELECT
  o.ORDER_ID,
  c.CUSTOMER_NAME,
  o.ORDER_DATE,
  o.TOTAL_AMOUNT,
  NVL(o.TOTAL_AMOUNT, 0) AS TOTAL_WITH_DEFAULT,
  DECODE(o.STATUS,
    'PENDING', '대기',
    'SHIPPED', '배송중',
    'DELIVERED', '완료',
    'CANCELLED', '취소',
    '기타') AS STATUS_KR,
  ROWNUM AS ROW_NUM
FROM SALES.ORDERS o
JOIN SALES.CUSTOMERS c ON o.CUSTOMER_ID = c.CUSTOMER_ID
WHERE o.ORDER_DATE >= ADD_MONTHS(SYSDATE, -12)
ORDER BY o.ORDER_DATE DESC;`,
    postgresqlDDL: `CREATE OR REPLACE VIEW sales.vw_order_summary AS
SELECT
  o.order_id,
  c.customer_name,
  o.order_date,
  o.total_amount,
  COALESCE(o.total_amount, 0) AS total_with_default,
  CASE o.status
    WHEN 'PENDING' THEN '대기'
    WHEN 'SHIPPED' THEN '배송중'
    WHEN 'DELIVERED' THEN '완료'
    WHEN 'CANCELLED' THEN '취소'
    ELSE '기타'
  END AS status_kr,
  ROW_NUMBER() OVER (ORDER BY o.order_date DESC) AS row_num
FROM sales.orders o
JOIN sales.customers c ON o.customer_id = c.customer_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY o.order_date DESC;`,
    score: 96,
    rules: ['NVL→COALESCE', 'DECODE→CASE', 'ROWNUM→ROW_NUMBER()', 'ADD_MONTHS→INTERVAL', 'SYSDATE→CURRENT_DATE'],
    remediationHistory: [],
  },
  {
    objectName: 'PKG_FIN.PROC_CLOSE_PERIOD',
    objectType: 'PROCEDURE',
    oracleDDL: `CREATE OR REPLACE PROCEDURE PKG_FIN.PROC_CLOSE_PERIOD(
  p_period_id   IN NUMBER,
  p_closed_by   IN VARCHAR2,
  p_status      OUT VARCHAR2
) AS
  v_open_items NUMBER;
  e_period_not_open EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_period_not_open, -20001);
BEGIN
  SELECT COUNT(*)
  INTO v_open_items
  FROM FIN.GL_JOURNAL_ENTRIES
  WHERE period_id = p_period_id
    AND status = 'UNPOSTED';

  IF v_open_items > 0 THEN
    RAISE_APPLICATION_ERROR(-20001,
      'Cannot close period: ' || v_open_items || ' unposted entries');
  END IF;

  UPDATE FIN.GL_PERIODS
  SET status = 'CLOSED',
      closed_by = p_closed_by,
      closed_date = SYSDATE
  WHERE period_id = p_period_id;

  p_status := 'SUCCESS';
  COMMIT;
EXCEPTION
  WHEN e_period_not_open THEN
    p_status := 'FAILED';
    ROLLBACK;
  WHEN OTHERS THEN
    p_status := 'ERROR';
    ROLLBACK;
    RAISE;
END PROC_CLOSE_PERIOD;`,
    postgresqlDDL: `CREATE OR REPLACE FUNCTION fin.close_period(
  p_period_id   INTEGER,
  p_closed_by   VARCHAR
) RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_open_items INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_open_items
  FROM fin.gl_journal_entries
  WHERE period_id = p_period_id
    AND status = 'UNPOSTED';

  IF v_open_items > 0 THEN
    RAISE EXCEPTION 'Cannot close period: % unposted entries', v_open_items;
  END IF;

  UPDATE fin.gl_periods
  SET status = 'CLOSED',
      closed_by = p_closed_by,
      closed_date = CURRENT_TIMESTAMP
  WHERE period_id = p_period_id;

  RETURN 'SUCCESS';
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;`,
    score: 88,
    rules: ['OUT param→RETURNS', 'RAISE_APPLICATION_ERROR→RAISE EXCEPTION', 'PRAGMA removed', 'COMMIT/ROLLBACK removed', 'SYSDATE→CURRENT_TIMESTAMP'],
    remediationHistory: [
      { attempt: 1, changes: 'Initial conversion kept OUT parameter pattern', score: 60 },
      { attempt: 2, changes: 'Changed to RETURNS pattern, fixed exception handling', score: 82 },
      { attempt: 3, changes: 'Refined RAISE EXCEPTION format, removed explicit COMMIT/ROLLBACK', score: 88 },
    ],
  },
  {
    objectName: 'MV_SALES_MONTHLY',
    objectType: 'MATERIALIZED VIEW',
    oracleDDL: `CREATE MATERIALIZED VIEW SALES.MV_SALES_MONTHLY
BUILD IMMEDIATE
REFRESH FAST ON DEMAND
AS
SELECT
  TO_CHAR(order_date, 'YYYY-MM') AS sales_month,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_sales,
  AVG(total_amount) AS avg_order_value
FROM SALES.ORDERS
WHERE status != 'CANCELLED'
GROUP BY TO_CHAR(order_date, 'YYYY-MM');`,
    postgresqlDDL: `CREATE MATERIALIZED VIEW sales.mv_sales_monthly AS
SELECT
  TO_CHAR(order_date, 'YYYY-MM') AS sales_month,
  COUNT(*) AS order_count,
  SUM(total_amount) AS total_sales,
  AVG(total_amount) AS avg_order_value
FROM sales.orders
WHERE status != 'CANCELLED'
GROUP BY TO_CHAR(order_date, 'YYYY-MM');

-- Note: PostgreSQL materialized views are refreshed manually
-- REFRESH MATERIALIZED VIEW sales.mv_sales_monthly;`,
    score: 90,
    rules: ['BUILD IMMEDIATE removed', 'REFRESH clause→comment', 'TO_CHAR compatible'],
    remediationHistory: [],
  },
  {
    objectName: 'SEQ_ORDER_ID',
    objectType: 'SEQUENCE',
    oracleDDL: `CREATE SEQUENCE SALES.SEQ_ORDER_ID
  START WITH 100000
  INCREMENT BY 1
  MAXVALUE 9999999999
  NOCYCLE
  CACHE 20;`,
    postgresqlDDL: `CREATE SEQUENCE sales.seq_order_id
  START WITH 100000
  INCREMENT BY 1
  MAXVALUE 9999999999
  NO CYCLE
  CACHE 20;`,
    score: 100,
    rules: ['NOCYCLE→NO CYCLE', 'lowercase identifiers'],
    remediationHistory: [],
  },
  {
    objectName: 'PKG_INV.PROC_ADJUST_STOCK',
    objectType: 'PROCEDURE',
    oracleDDL: `CREATE OR REPLACE PROCEDURE PKG_INV.PROC_ADJUST_STOCK(
  p_item_id    IN NUMBER,
  p_warehouse  IN VARCHAR2,
  p_qty_change IN NUMBER,
  p_reason     IN VARCHAR2
) AS
  v_current_qty NUMBER;
  v_new_qty     NUMBER;
BEGIN
  SELECT quantity
  INTO v_current_qty
  FROM INV.WAREHOUSE_STOCK
  WHERE item_id = p_item_id
    AND warehouse_code = p_warehouse
  FOR UPDATE NOWAIT;

  v_new_qty := v_current_qty + p_qty_change;

  IF v_new_qty < 0 THEN
    RAISE_APPLICATION_ERROR(-20100, 'Insufficient stock');
  END IF;

  UPDATE INV.WAREHOUSE_STOCK
  SET quantity = v_new_qty,
      last_updated = SYSDATE
  WHERE item_id = p_item_id
    AND warehouse_code = p_warehouse;

  INSERT INTO INV.STOCK_ADJUSTMENTS (
    adjustment_id, item_id, warehouse_code,
    qty_before, qty_after, reason, adjusted_date
  ) VALUES (
    SEQ_ADJUSTMENT_ID.NEXTVAL, p_item_id, p_warehouse,
    v_current_qty, v_new_qty, p_reason, SYSDATE
  );

  COMMIT;
END PROC_ADJUST_STOCK;`,
    postgresqlDDL: `CREATE OR REPLACE FUNCTION inv.adjust_stock(
  p_item_id    INTEGER,
  p_warehouse  VARCHAR,
  p_qty_change INTEGER,
  p_reason     VARCHAR
) RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_qty INTEGER;
  v_new_qty     INTEGER;
BEGIN
  SELECT quantity
  INTO v_current_qty
  FROM inv.warehouse_stock
  WHERE item_id = p_item_id
    AND warehouse_code = p_warehouse
  FOR UPDATE NOWAIT;

  v_new_qty := v_current_qty + p_qty_change;

  IF v_new_qty < 0 THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  UPDATE inv.warehouse_stock
  SET quantity = v_new_qty,
      last_updated = CURRENT_TIMESTAMP
  WHERE item_id = p_item_id
    AND warehouse_code = p_warehouse;

  INSERT INTO inv.stock_adjustments (
    adjustment_id, item_id, warehouse_code,
    qty_before, qty_after, reason, adjusted_date
  ) VALUES (
    nextval('inv.seq_adjustment_id'), p_item_id, p_warehouse,
    v_current_qty, v_new_qty, p_reason, CURRENT_TIMESTAMP
  );
END;
$$;`,
    score: 94,
    rules: ['Procedure→RETURNS VOID function', 'RAISE_APPLICATION_ERROR→RAISE EXCEPTION', 'NEXTVAL→nextval()', 'SYSDATE→CURRENT_TIMESTAMP', 'COMMIT removed'],
    remediationHistory: [
      { attempt: 1, changes: 'Initial conversion, COMMIT not removed', score: 80 },
      { attempt: 2, changes: 'Removed explicit COMMIT, fixed nextval syntax', score: 94 },
    ],
  },
];

export const schemaValidation = [
  { objectType: 'Tables', oracleCount: 168, postgresCount: 168, matched: 168, mismatched: 0, missing: 0 },
  { objectType: 'Columns', oracleCount: 2851, postgresCount: 2847, matched: 2843, mismatched: 4, missing: 4 },
  { objectType: 'Indexes', oracleCount: 234, postgresCount: 230, matched: 226, mismatched: 4, missing: 4 },
  { objectType: 'Constraints', oracleCount: 312, postgresCount: 312, matched: 312, mismatched: 0, missing: 0 },
  { objectType: 'Sequences', oracleCount: 45, postgresCount: 45, matched: 45, mismatched: 0, missing: 0 },
  { objectType: 'Procedures', oracleCount: 47, postgresCount: 44, matched: 42, mismatched: 2, missing: 3 },
  { objectType: 'Functions', oracleCount: 89, postgresCount: 86, matched: 83, mismatched: 3, missing: 3 },
  { objectType: 'Views', oracleCount: 34, postgresCount: 33, matched: 32, mismatched: 1, missing: 1 },
  { objectType: 'Triggers', oracleCount: 28, postgresCount: 28, matched: 28, mismatched: 0, missing: 0 },
  { objectType: 'Materialized Views', oracleCount: 8, postgresCount: 8, matched: 8, mismatched: 0, missing: 0 },
];

export const conversionContext = {
  schemaMapping: [
    { oracle: 'HR', postgresql: 'hr' },
    { oracle: 'SALES', postgresql: 'sales' },
    { oracle: 'FIN', postgresql: 'fin' },
    { oracle: 'INV', postgresql: 'inv' },
    { oracle: 'CRM', postgresql: 'crm' },
    { oracle: 'WMS', postgresql: 'wms' },
    { oracle: 'MFG', postgresql: 'mfg' },
    { oracle: 'QA_TEST', postgresql: 'qa_test' },
  ],
  packageMapping: [
    { oraclePackage: 'PKG_ORDER_MGMT', postgresSchema: 'sales', functions: ['calc_total', 'apply_discount', 'get_order_status', 'cancel_order', 'process_return'] },
    { oraclePackage: 'PKG_HR', postgresSchema: 'hr', functions: ['hire_employee', 'transfer_dept', 'calc_salary', 'terminate_employee', 'update_benefits'] },
    { oraclePackage: 'PKG_FIN', postgresSchema: 'fin', functions: ['close_period', 'gen_trial_balance', 'calc_tax', 'post_journal', 'reconcile_accounts'] },
    { oraclePackage: 'PKG_INV', postgresSchema: 'inv', functions: ['adjust_stock', 'check_availability', 'transfer_stock', 'count_inventory', 'reorder_check'] },
    { oraclePackage: 'PKG_CRM', postgresSchema: 'crm', functions: ['create_lead', 'convert_opportunity', 'update_contact', 'assign_territory'] },
  ],
  dataTypeMapping: [
    { oracle: 'NUMBER(p,s)', postgresql: 'NUMERIC(p,s)' },
    { oracle: 'NUMBER(p) [p<=4]', postgresql: 'SMALLINT' },
    { oracle: 'NUMBER(p) [p<=9]', postgresql: 'INTEGER' },
    { oracle: 'NUMBER(p) [p<=18]', postgresql: 'BIGINT' },
    { oracle: 'VARCHAR2(n)', postgresql: 'VARCHAR(n)' },
    { oracle: 'NVARCHAR2(n)', postgresql: 'VARCHAR(n)' },
    { oracle: 'CHAR(n)', postgresql: 'CHAR(n)' },
    { oracle: 'CLOB', postgresql: 'TEXT' },
    { oracle: 'BLOB', postgresql: 'BYTEA' },
    { oracle: 'DATE', postgresql: 'TIMESTAMP' },
    { oracle: 'TIMESTAMP WITH TIME ZONE', postgresql: 'TIMESTAMPTZ' },
    { oracle: 'RAW(n)', postgresql: 'BYTEA' },
    { oracle: 'LONG', postgresql: 'TEXT' },
    { oracle: 'XMLTYPE', postgresql: 'XML' },
    { oracle: 'BINARY_FLOAT', postgresql: 'REAL' },
    { oracle: 'BINARY_DOUBLE', postgresql: 'DOUBLE PRECISION' },
  ],
  dbLinkMapping: [
    { original: 'DBLINK_LEGACY_SYSTEM', replacement: 'postgres_fdw extension → legacy_server foreign server' },
    { original: 'DBLINK_REPORTING', replacement: 'postgres_fdw extension → reporting_server foreign server' },
    { original: 'DBLINK_BACKUP_DB', replacement: 'Removed (backup handled by AWS RDS automated backups)' },
  ],
};
