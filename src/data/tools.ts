// Tools mock data for OMA WebUI v2

export const sampleQueries = [
  {
    name: '직원 목록 조회',
    sql: "SELECT employee_id, first_name || ' ' || last_name AS full_name, NVL(salary, 0) AS salary, department_id FROM hr.employees WHERE department_id = :dept_id ORDER BY last_name",
    description: '부서별 직원 목록을 급여 정보와 함께 조회합니다. NVL 함수가 PostgreSQL COALESCE로 변환됩니다.',
  },
  {
    name: '주문 현황 페이징',
    sql: "SELECT * FROM (SELECT o.*, ROWNUM rn FROM sales.orders o WHERE status = :status AND order_date >= SYSDATE - :days ORDER BY order_date DESC) WHERE rn BETWEEN :start_row AND :end_row",
    description: 'ROWNUM 기반 페이징 쿼리입니다. PostgreSQL에서는 LIMIT/OFFSET으로 변환됩니다.',
  },
  {
    name: '부서 계층 구조',
    sql: "SELECT department_id, department_name, LEVEL, SYS_CONNECT_BY_PATH(department_name, '/') AS path FROM hr.departments START WITH parent_dept_id IS NULL CONNECT BY PRIOR department_id = parent_dept_id",
    description: 'Oracle 계층형 쿼리입니다. PostgreSQL WITH RECURSIVE로 변환됩니다.',
  },
  {
    name: '월별 매출 리포트',
    sql: "SELECT TO_CHAR(order_date, 'YYYY-MM') AS month, COUNT(*) AS orders, SUM(NVL(total_amount, 0)) AS revenue, DECODE(status, 'DELIVERED', '완료', 'PENDING', '대기', '기타') AS status_name FROM sales.orders GROUP BY TO_CHAR(order_date, 'YYYY-MM'), status ORDER BY month DESC",
    description: 'DECODE, NVL, TO_CHAR 등 다수의 Oracle 함수를 포함한 리포트 쿼리입니다.',
  },
  {
    name: '재고 현황 MERGE',
    sql: "MERGE INTO inv.warehouse_stock ws USING (SELECT :item_id AS item_id, :wh_code AS wh_code, :qty AS qty FROM DUAL) src ON (ws.item_id = src.item_id AND ws.warehouse_code = src.wh_code) WHEN MATCHED THEN UPDATE SET ws.quantity = ws.quantity + src.qty WHEN NOT MATCHED THEN INSERT VALUES (src.item_id, src.wh_code, src.qty, SYSDATE)",
    description: 'MERGE 문을 PostgreSQL INSERT ON CONFLICT로 변환합니다.',
  },
  {
    name: '매출 Top 10 제품',
    sql: "SELECT * FROM (SELECT p.product_name, SUM(oi.quantity) AS total_qty, SUM(oi.quantity * oi.unit_price) AS total_sales FROM sales.order_items oi JOIN sales.products p ON oi.product_id = p.product_id WHERE oi.order_date >= ADD_MONTHS(SYSDATE, -12) GROUP BY p.product_name ORDER BY total_sales DESC) WHERE ROWNUM <= 10",
    description: 'ROWNUM과 ADD_MONTHS를 사용한 Top-N 쿼리입니다.',
  },
  {
    name: '직원 부서별 STRING 집계',
    sql: "SELECT department_id, LISTAGG(first_name || ' ' || last_name, ', ') WITHIN GROUP (ORDER BY hire_date) AS team_members FROM hr.employees GROUP BY department_id",
    description: 'LISTAGG를 PostgreSQL STRING_AGG로 변환합니다.',
  },
  {
    name: '외부 조인 변환',
    sql: "SELECT j.journal_id, j.amount, a.account_name, p.period_name FROM fin.gl_journal_entries j, fin.gl_accounts a, fin.gl_periods p WHERE j.account_id = a.account_id(+) AND j.period_id = p.period_id(+) AND j.status = 'POSTED'",
    description: 'Oracle (+) 외부 조인 문법을 표준 LEFT JOIN으로 변환합니다.',
  },
  {
    name: '시퀀스 조회',
    sql: "SELECT seq_order_id.NEXTVAL AS next_id FROM DUAL",
    description: 'Oracle 시퀀스 및 DUAL 테이블 문법을 PostgreSQL로 변환합니다.',
  },
  {
    name: '동적 정규식 검색',
    sql: "SELECT customer_id, customer_name, phone_number FROM sales.customers WHERE REGEXP_LIKE(email, :pattern) AND NVL(status, 'ACTIVE') = 'ACTIVE'",
    description: 'REGEXP_LIKE를 PostgreSQL ~ 연산자로, NVL을 COALESCE로 변환합니다.',
  },
];

export const realtimeLogs = [
  { timestamp: '2026-04-06T10:15:00.000Z', level: 'info' as const, message: 'OMA Engine v2.4.1 started', source: 'system' },
  { timestamp: '2026-04-06T10:15:00.120Z', level: 'info' as const, message: 'Connected to Oracle source: oma-source.cx1234abcdef.ap-northeast-2.rds.amazonaws.com:1521/OMAPROD', source: 'connector' },
  { timestamp: '2026-04-06T10:15:00.340Z', level: 'info' as const, message: 'Connected to PostgreSQL target: oma-target.cx1234abcdef.ap-northeast-2.rds.amazonaws.com:5432/omaprod', source: 'connector' },
  { timestamp: '2026-04-06T10:15:01.100Z', level: 'info' as const, message: 'Loading conversion context from oma-context/conversion-context.json', source: 'context-loader' },
  { timestamp: '2026-04-06T10:15:01.450Z', level: 'info' as const, message: 'Loaded 16 data type mappings, 5 package mappings, 8 schema mappings', source: 'context-loader' },
  { timestamp: '2026-04-06T10:15:02.000Z', level: 'info' as const, message: 'Starting MyBatis XML extraction from src/main/resources/mapper/', source: 'extractor' },
  { timestamp: '2026-04-06T10:15:02.230Z', level: 'info' as const, message: 'Found 22 mapper XML files', source: 'extractor' },
  { timestamp: '2026-04-06T10:15:03.100Z', level: 'info' as const, message: 'Extracted 44 SQL statements from mapper files', source: 'extractor' },
  { timestamp: '2026-04-06T10:15:03.500Z', level: 'info' as const, message: 'SQL filtering: 34 need conversion, 10 no conversion needed', source: 'filter' },
  { timestamp: '2026-04-06T10:15:04.000Z', level: 'info' as const, message: 'Starting query rewrite phase for 34 SQL statements', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:04.200Z', level: 'info' as const, message: '[1/34] Converting sql-001: NVL → COALESCE', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:04.450Z', level: 'info' as const, message: '[1/34] sql-001 converted successfully (score: 100)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:04.700Z', level: 'info' as const, message: '[2/34] Converting sql-002: NVL → COALESCE', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:04.950Z', level: 'info' as const, message: '[2/34] sql-002 converted successfully (score: 100)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:05.200Z', level: 'info' as const, message: '[3/34] Converting sql-004: SYSDATE, NEXTVAL', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:05.800Z', level: 'info' as const, message: '[3/34] sql-004 converted successfully (score: 98)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:06.100Z', level: 'info' as const, message: '[4/34] Converting sql-007: ROWNUM pagination', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:07.500Z', level: 'warn' as const, message: '[4/34] sql-007 first attempt failed: incorrect OFFSET calculation', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:08.200Z', level: 'info' as const, message: '[4/34] sql-007 retry #1: adjusting LIMIT/OFFSET logic', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:09.000Z', level: 'info' as const, message: '[4/34] sql-007 converted successfully after 1 retry (score: 95)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:09.500Z', level: 'info' as const, message: '[5/34] Converting sql-010: DECODE → CASE WHEN', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:10.100Z', level: 'info' as const, message: '[5/34] sql-010 converted successfully (score: 100)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:10.500Z', level: 'info' as const, message: '[6/34] Converting sql-012: CONNECT BY hierarchical query', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:12.000Z', level: 'debug' as const, message: 'Agent invoked for complex CONNECT BY conversion', source: 'agent' },
  { timestamp: '2026-04-06T10:15:13.500Z', level: 'debug' as const, message: 'Schema Architect analyzing hierarchical query pattern', source: 'agent' },
  { timestamp: '2026-04-06T10:15:15.000Z', level: 'warn' as const, message: '[6/34] sql-012 attempt #1: WITH RECURSIVE missing anchor', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:16.500Z', level: 'warn' as const, message: '[6/34] sql-012 attempt #2: ORDER SIBLINGS translation incorrect', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:18.000Z', level: 'info' as const, message: '[6/34] sql-012 converted successfully after 2 retries (score: 92)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:18.500Z', level: 'info' as const, message: '[7/34] Converting sql-015: DUAL table, NEXTVAL', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:19.000Z', level: 'info' as const, message: '[7/34] sql-015 converted successfully (score: 100)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:19.500Z', level: 'info' as const, message: '[8/34] Converting sql-021: MINUS → EXCEPT', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:20.200Z', level: 'info' as const, message: '[8/34] sql-021 converted successfully (score: 100)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:20.700Z', level: 'info' as const, message: '[9/34] Converting sql-023: (+) outer join', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:21.300Z', level: 'info' as const, message: '[9/34] sql-023 converted successfully (score: 100)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:21.800Z', level: 'info' as const, message: '[10/34] Converting sql-028: MERGE → INSERT ON CONFLICT', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:23.500Z', level: 'warn' as const, message: '[10/34] sql-028 first attempt: incorrect ON CONFLICT syntax', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:24.800Z', level: 'info' as const, message: '[10/34] sql-028 converted successfully after 1 retry (score: 96)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:25.300Z', level: 'info' as const, message: 'Query rewrite progress: 10/34 completed', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:26.000Z', level: 'info' as const, message: '[11/34] Converting sql-006: TRUNC(SYSDATE)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:27.500Z', level: 'error' as const, message: '[11/34] sql-006 FAILED after 3 retries: TYPE_MISMATCH - timestamp vs date comparison', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:28.000Z', level: 'info' as const, message: '[12/34] Converting sql-017: NVL + ROWNUM + dynamic tags', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:29.500Z', level: 'debug' as const, message: 'Preserving MyBatis dynamic tags during conversion', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:30.500Z', level: 'info' as const, message: '[12/34] sql-017 converted successfully after 1 retry (score: 94)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:31.000Z', level: 'info' as const, message: '[13/34] Converting sql-018: NVL + ADD_MONTHS + dynamic tags', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:33.500Z', level: 'warn' as const, message: '[13/34] sql-018 INTERVAL with bind variable parse error', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:35.000Z', level: 'warn' as const, message: '[13/34] sql-018 retry #2: still failing - INTERVAL cast issue', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:36.000Z', level: 'info' as const, message: 'Query rewrite progress: 20/34 completed', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:37.000Z', level: 'info' as const, message: '[20/34] Converting sql-040: complex dynamic query with DECODE + NVL', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:38.500Z', level: 'info' as const, message: '[20/34] sql-040 converted successfully (score: 97)', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:39.000Z', level: 'info' as const, message: 'Query rewrite progress: 30/34 completed', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:40.000Z', level: 'info' as const, message: 'Query rewrite phase complete: 31 pass, 1 fail, 2 retry', source: 'rewriter' },
  { timestamp: '2026-04-06T10:15:40.500Z', level: 'info' as const, message: 'Starting XML merge phase for 12 mapper files', source: 'merger' },
  { timestamp: '2026-04-06T10:15:41.200Z', level: 'info' as const, message: 'Merged EmployeeMapper.xml: 8 changes applied', source: 'merger' },
  { timestamp: '2026-04-06T10:15:41.800Z', level: 'info' as const, message: 'Merged OrderMapper.xml: 12 changes applied', source: 'merger' },
  { timestamp: '2026-04-06T10:15:42.300Z', level: 'info' as const, message: 'Merged CustomerMapper.xml: 6 changes applied', source: 'merger' },
  { timestamp: '2026-04-06T10:15:42.800Z', level: 'warn' as const, message: 'SalesReportMapper.xml: validation warning - complex nested subquery', source: 'merger' },
  { timestamp: '2026-04-06T10:15:43.500Z', level: 'info' as const, message: 'XML merge complete: 12 files merged, 69 total changes', source: 'merger' },
  { timestamp: '2026-04-06T10:15:44.000Z', level: 'info' as const, message: 'Starting test execution phase', source: 'tester' },
  { timestamp: '2026-04-06T10:15:45.000Z', level: 'info' as const, message: 'Test execution: 35/44 queries passed', source: 'tester' },
  { timestamp: '2026-04-06T10:15:45.500Z', level: 'error' as const, message: 'Test failed: sql-006 - operator does not exist: timestamp = date', source: 'tester' },
  { timestamp: '2026-04-06T10:15:46.000Z', level: 'error' as const, message: 'Test failed: sql-018 - INTERVAL bind variable syntax error', source: 'tester' },
  { timestamp: '2026-04-06T10:15:46.500Z', level: 'info' as const, message: 'Starting auto-fix for 7 test failures', source: 'fixer' },
  { timestamp: '2026-04-06T10:15:48.000Z', level: 'info' as const, message: 'Auto-fixed 5/7 errors, 2 require manual review', source: 'fixer' },
  { timestamp: '2026-04-06T10:15:48.500Z', level: 'info' as const, message: 'Pipeline execution summary: 44 total SQLs, 34 converted, 10 unchanged, 5 errors fixed, 2 pending', source: 'system' },
];

export const agentLogs = [
  {
    timestamp: '2026-04-06T10:15:12.000Z',
    agent: 'Discovery',
    action: 'Analyzing failed SQL conversion',
    tool: 'sql-parser',
    input: 'sql-012: CONNECT BY hierarchical query',
    output: 'Identified: CONNECT BY PRIOR, SYS_CONNECT_BY_PATH, LEVEL pseudo-column, ORDER SIBLINGS BY',
    thinking: 'This is a hierarchical query that requires WITH RECURSIVE in PostgreSQL. Need to identify the anchor member (START WITH) and recursive member (CONNECT BY PRIOR).',
  },
  {
    timestamp: '2026-04-06T10:15:13.000Z',
    agent: 'Schema Architect',
    action: 'Mapping hierarchical query structure',
    tool: 'schema-analyzer',
    input: 'HR.DEPARTMENTS table with parent_dept_id self-reference',
    output: 'Confirmed: department_id → parent_dept_id recursive relationship. Max depth: 5 levels.',
    thinking: 'The START WITH clause maps to the base case of the recursive CTE. CONNECT BY PRIOR maps to the JOIN condition in the recursive member.',
  },
  {
    timestamp: '2026-04-06T10:15:14.000Z',
    agent: 'Code Migrator',
    action: 'Generating WITH RECURSIVE CTE',
    tool: 'sql-rewriter',
    input: 'CONNECT BY PRIOR department_id = parent_dept_id',
    output: 'Generated WITH RECURSIVE dept_tree with anchor and recursive members',
    thinking: 'SYS_CONNECT_BY_PATH needs to be implemented as string concatenation in the recursive CTE. LEVEL becomes a counter that increments in each recursion.',
  },
  {
    timestamp: '2026-04-06T10:15:15.000Z',
    agent: 'QA Verifier',
    action: 'Validating converted query',
    tool: 'sql-executor',
    input: 'Execute converted query against PostgreSQL',
    output: 'ERROR: recursive query "dept_tree" does not have a UNION ALL',
  },
  {
    timestamp: '2026-04-06T10:15:15.500Z',
    agent: 'Code Migrator',
    action: 'Fixing recursive CTE - adding UNION ALL',
    tool: 'sql-rewriter',
    input: 'Add UNION ALL between anchor and recursive members',
    output: 'Fixed: Added UNION ALL, query executes but ORDER SIBLINGS not correct',
    thinking: 'PostgreSQL WITH RECURSIVE requires explicit UNION ALL. ORDER SIBLINGS BY needs to be translated to ORDER BY using the path column.',
  },
  {
    timestamp: '2026-04-06T10:15:16.500Z',
    agent: 'QA Verifier',
    action: 'Re-validating converted query',
    tool: 'sql-executor',
    input: 'Execute revised query',
    output: 'Query executes but row order differs from Oracle result',
  },
  {
    timestamp: '2026-04-06T10:15:17.000Z',
    agent: 'Code Migrator',
    action: 'Fixing ORDER SIBLINGS translation',
    tool: 'sql-rewriter',
    input: 'Replace ORDER SIBLINGS BY department_name with ORDER BY path',
    output: 'Fixed: Using path column for ordering preserves hierarchical sibling order',
    thinking: 'ORDER SIBLINGS BY maintains the hierarchical structure while ordering siblings. Using the computed path column achieves the same effect.',
  },
  {
    timestamp: '2026-04-06T10:15:18.000Z',
    agent: 'QA Verifier',
    action: 'Final validation',
    tool: 'sql-executor',
    input: 'Execute final query and compare results',
    output: '27 rows returned. Row-by-row comparison: MATCH',
  },
  {
    timestamp: '2026-04-06T10:15:18.200Z',
    agent: 'Evaluator',
    action: 'Scoring conversion quality',
    tool: 'evaluator',
    input: 'sql-012 conversion: Oracle CONNECT BY → PostgreSQL WITH RECURSIVE',
    output: 'Score: 92/100. Deductions: -5 for 2 retries, -3 for ORDER BY approximation',
    thinking: 'The conversion is functionally correct and produces matching results. Minor deductions for requiring retries and the ORDER SIBLINGS approximation.',
  },
  {
    timestamp: '2026-04-06T10:15:22.000Z',
    agent: 'Discovery',
    action: 'Analyzing MERGE statement',
    tool: 'sql-parser',
    input: 'sql-028: MERGE INTO with DUAL source',
    output: 'Identified: MERGE INTO, USING DUAL, WHEN MATCHED/NOT MATCHED, SYSDATE',
    thinking: 'PostgreSQL 9.5+ supports INSERT ON CONFLICT (UPSERT). The DUAL table source with bind variables can be simplified to direct VALUES clause.',
  },
  {
    timestamp: '2026-04-06T10:15:22.500Z',
    agent: 'Code Migrator',
    action: 'Converting MERGE to INSERT ON CONFLICT',
    tool: 'sql-rewriter',
    input: 'MERGE INTO inv.warehouse_stock',
    output: 'Generated INSERT ON CONFLICT with EXCLUDED reference',
    thinking: 'WHEN MATCHED maps to DO UPDATE SET. WHEN NOT MATCHED maps to the INSERT itself. The EXCLUDED keyword references the proposed insert values.',
  },
  {
    timestamp: '2026-04-06T10:15:23.500Z',
    agent: 'QA Verifier',
    action: 'Validating UPSERT query',
    tool: 'sql-executor',
    input: 'Execute INSERT ON CONFLICT',
    output: 'ERROR: ON CONFLICT DO UPDATE requires inference specification or constraint name',
  },
  {
    timestamp: '2026-04-06T10:15:24.000Z',
    agent: 'Code Migrator',
    action: 'Adding conflict target columns',
    tool: 'sql-rewriter',
    input: 'Add ON CONFLICT (item_id, warehouse_code)',
    output: 'Fixed: Added composite unique key as conflict target',
    thinking: 'PostgreSQL requires explicit conflict columns or constraint name. Using the composite key (item_id, warehouse_code) matches the MERGE ON clause.',
  },
  {
    timestamp: '2026-04-06T10:15:24.800Z',
    agent: 'QA Verifier',
    action: 'Final validation',
    tool: 'sql-executor',
    input: 'Execute fixed UPSERT',
    output: '1 row affected. Verification: stock quantity updated correctly.',
  },
  {
    timestamp: '2026-04-06T10:15:25.000Z',
    agent: 'Evaluator',
    action: 'Scoring MERGE conversion',
    tool: 'evaluator',
    input: 'sql-028 conversion: Oracle MERGE → PostgreSQL INSERT ON CONFLICT',
    output: 'Score: 96/100. Deductions: -4 for 1 retry',
  },
  {
    timestamp: '2026-04-06T10:15:26.000Z',
    agent: 'Discovery',
    action: 'Analyzing DBMS_LOB usage',
    tool: 'sql-parser',
    input: 'sql-042: DBMS_LOB.GETLENGTH and DBMS_LOB.SUBSTR',
    output: 'Identified: DBMS_LOB package functions used for CLOB handling',
    thinking: 'PostgreSQL TEXT type handles large objects natively. DBMS_LOB.GETLENGTH maps to LENGTH, DBMS_LOB.SUBSTR maps to SUBSTRING.',
  },
  {
    timestamp: '2026-04-06T10:15:26.500Z',
    agent: 'Code Migrator',
    action: 'Converting DBMS_LOB functions',
    tool: 'sql-rewriter',
    input: 'DBMS_LOB.GETLENGTH(description), DBMS_LOB.SUBSTR(description, 200, 1)',
    output: 'Converted to LENGTH(description), SUBSTRING(description FROM 1 FOR 200)',
  },
  {
    timestamp: '2026-04-06T10:15:27.000Z',
    agent: 'QA Verifier',
    action: 'Validation passed',
    tool: 'sql-executor',
    input: 'Execute converted query',
    output: '15 rows returned. Results match Oracle output.',
  },
  {
    timestamp: '2026-04-06T10:15:27.200Z',
    agent: 'Evaluator',
    action: 'Scoring DBMS_LOB conversion',
    tool: 'evaluator',
    input: 'sql-042 conversion: DBMS_LOB → standard SQL functions',
    output: 'Score: 100/100. Clean conversion with no retries.',
  },
];

export const conversionPatterns = [
  {
    id: 'pat-001',
    oraclePattern: 'NVL(expr1, expr2)',
    postgresPattern: 'COALESCE(expr1, expr2)',
    category: 'Function',
    description: 'NULL 값 대체 함수',
    example: "NVL(salary, 0) → COALESCE(salary, 0)",
  },
  {
    id: 'pat-002',
    oraclePattern: 'NVL2(expr1, expr2, expr3)',
    postgresPattern: 'CASE WHEN expr1 IS NOT NULL THEN expr2 ELSE expr3 END',
    category: 'Function',
    description: 'NULL 여부에 따른 조건 반환',
    example: "NVL2(comm, salary+comm, salary) → CASE WHEN comm IS NOT NULL THEN salary+comm ELSE salary END",
  },
  {
    id: 'pat-003',
    oraclePattern: "DECODE(expr, val1, res1, val2, res2, default)",
    postgresPattern: "CASE expr WHEN val1 THEN res1 WHEN val2 THEN res2 ELSE default END",
    category: 'Function',
    description: '값 비교 조건 분기',
    example: "DECODE(status, 'A', 'Active', 'I', 'Inactive', 'Unknown') → CASE status WHEN 'A' THEN 'Active' WHEN 'I' THEN 'Inactive' ELSE 'Unknown' END",
  },
  {
    id: 'pat-004',
    oraclePattern: 'SYSDATE',
    postgresPattern: 'CURRENT_TIMESTAMP',
    category: 'Date/Time',
    description: '현재 날짜/시간',
    example: "INSERT INTO t VALUES (SYSDATE) → INSERT INTO t VALUES (CURRENT_TIMESTAMP)",
  },
  {
    id: 'pat-005',
    oraclePattern: 'ADD_MONTHS(date, n)',
    postgresPattern: "date + INTERVAL 'n months'",
    category: 'Date/Time',
    description: '월 단위 날짜 연산',
    example: "ADD_MONTHS(SYSDATE, -12) → CURRENT_DATE - INTERVAL '12 months'",
  },
  {
    id: 'pat-006',
    oraclePattern: 'ROWNUM <= n',
    postgresPattern: 'LIMIT n',
    category: 'Pagination',
    description: '결과 행 수 제한',
    example: "WHERE ROWNUM <= 10 → LIMIT 10",
  },
  {
    id: 'pat-007',
    oraclePattern: 'ROWNUM BETWEEN start AND end',
    postgresPattern: 'LIMIT (end-start+1) OFFSET (start-1)',
    category: 'Pagination',
    description: '페이징 처리',
    example: "WHERE rn BETWEEN 21 AND 30 → LIMIT 10 OFFSET 20",
  },
  {
    id: 'pat-008',
    oraclePattern: 'CONNECT BY PRIOR ... START WITH ...',
    postgresPattern: 'WITH RECURSIVE ... UNION ALL ...',
    category: 'Hierarchical',
    description: '계층형 쿼리',
    example: "START WITH parent IS NULL CONNECT BY PRIOR id = parent_id → WITH RECURSIVE tree AS (SELECT ... WHERE parent IS NULL UNION ALL SELECT ... JOIN tree ON ...)",
  },
  {
    id: 'pat-009',
    oraclePattern: 'sequence_name.NEXTVAL',
    postgresPattern: "nextval('schema.sequence_name')",
    category: 'Sequence',
    description: '시퀀스 다음 값',
    example: "seq_id.NEXTVAL → nextval('public.seq_id')",
  },
  {
    id: 'pat-010',
    oraclePattern: 'SELECT ... FROM DUAL',
    postgresPattern: 'SELECT ...',
    category: 'Syntax',
    description: 'DUAL 테이블 제거',
    example: "SELECT SYSDATE FROM DUAL → SELECT CURRENT_TIMESTAMP",
  },
  {
    id: 'pat-011',
    oraclePattern: 'MINUS',
    postgresPattern: 'EXCEPT',
    category: 'Set Operator',
    description: '차집합 연산자',
    example: "SELECT a FROM t1 MINUS SELECT a FROM t2 → SELECT a FROM t1 EXCEPT SELECT a FROM t2",
  },
  {
    id: 'pat-012',
    oraclePattern: 'table1.col = table2.col(+)',
    postgresPattern: 'table1 LEFT JOIN table2 ON table1.col = table2.col',
    category: 'Join',
    description: 'Oracle 외부 조인 문법',
    example: "WHERE a.id = b.id(+) → FROM a LEFT JOIN b ON a.id = b.id",
  },
  {
    id: 'pat-013',
    oraclePattern: "LISTAGG(expr, sep) WITHIN GROUP (ORDER BY ...)",
    postgresPattern: "STRING_AGG(expr, sep ORDER BY ...)",
    category: 'Aggregate',
    description: '문자열 집계 함수',
    example: "LISTAGG(name, ',') WITHIN GROUP (ORDER BY id) → STRING_AGG(name, ',' ORDER BY id)",
  },
  {
    id: 'pat-014',
    oraclePattern: 'REGEXP_LIKE(expr, pattern)',
    postgresPattern: 'expr ~ pattern',
    category: 'Regex',
    description: '정규식 매칭',
    example: "REGEXP_LIKE(phone, '^010') → phone ~ '^010'",
  },
  {
    id: 'pat-015',
    oraclePattern: 'MERGE INTO ... USING ... WHEN MATCHED/NOT MATCHED',
    postgresPattern: 'INSERT INTO ... ON CONFLICT ... DO UPDATE/NOTHING',
    category: 'DML',
    description: 'UPSERT 문',
    example: "MERGE INTO t USING ... → INSERT INTO t ... ON CONFLICT (key) DO UPDATE SET ...",
  },
  {
    id: 'pat-016',
    oraclePattern: 'VARCHAR2(n)',
    postgresPattern: 'VARCHAR(n)',
    category: 'Data Type',
    description: '가변 문자열 타입',
    example: "VARCHAR2(100) → VARCHAR(100)",
  },
  {
    id: 'pat-017',
    oraclePattern: 'NUMBER(p,s)',
    postgresPattern: 'NUMERIC(p,s)',
    category: 'Data Type',
    description: '숫자 타입',
    example: "NUMBER(10,2) → NUMERIC(10,2)",
  },
];

export const reportSections = [
  {
    title: '변환 요약 (Conversion Summary)',
    content: `## Oracle → PostgreSQL 마이그레이션 변환 리포트

**프로젝트**: OMA 데모 시스템
**실행일**: 2026-04-06
**소스 DB**: Oracle 19c (19.3.0.0)
**타겟 DB**: PostgreSQL 15.4

### 전체 변환 현황
- 총 SQL 수: 44개
- 변환 필요: 34개
- 변환 불필요: 10개
- 변환 성공: 31개 (91.2%)
- 변환 실패: 1개 (2.9%)
- 재시도 중: 2개 (5.9%)`,
  },
  {
    title: '스키마 변환 결과 (Schema Conversion)',
    content: `### DB 스키마 변환 현황
- 총 객체 수: 1,012개
- 자동 변환: 847개 (83.7%)
- 에이전트 변환: 68개 (6.7%)
- 실패: 12개 (1.2%)
- 수동 검토 필요: 85개 (8.4%)

### 주요 변환 이슈
1. **DBMS_SQL 동적 커서**: FN_CALC_TAX에서 사용 - 수동 변환 필요
2. **CONNECT BY 뷰**: VW_GL_BALANCE_SHEET - WITH RECURSIVE로 수동 변환 필요
3. **데이터베이스 링크**: DBLINK_LEGACY_SYSTEM - postgres_fdw 구성 필요
4. **중첩 TABLE 타입**: TYPE_ORDER_LINE_TAB - PostgreSQL 배열/JSON으로 재설계 필요`,
  },
  {
    title: 'SQL 변환 패턴 분석 (Pattern Analysis)',
    content: `### 변환 패턴별 통계
| 패턴 | 발생 건수 | 성공률 |
|------|-----------|--------|
| NVL → COALESCE | 12 | 100% |
| DECODE → CASE | 4 | 100% |
| SYSDATE → CURRENT_TIMESTAMP | 8 | 87.5% |
| ROWNUM → LIMIT/OFFSET | 4 | 100% |
| CONNECT BY → WITH RECURSIVE | 2 | 100% |
| NEXTVAL syntax | 3 | 100% |
| FROM DUAL 제거 | 3 | 100% |
| MERGE → INSERT ON CONFLICT | 1 | 100% |
| MINUS → EXCEPT | 1 | 100% |
| (+) → LEFT JOIN | 1 | 100% |
| LISTAGG → STRING_AGG | 1 | 100% |
| REGEXP_LIKE → ~ | 1 | 100% |
| DBMS_LOB → LENGTH/SUBSTRING | 1 | 100% |
| ADD_MONTHS → INTERVAL | 3 | 66.7% |`,
  },
  {
    title: '데이터 마이그레이션 현황 (Data Migration)',
    content: `### 데이터 이관 현황
- 총 테이블: 168개
- 이관 완료: 156개 (92.9%)
- 진행 중: 2개
- 대기: 4개
- 실패: 1개 (COMMON.AUDIT_LOG - DMS 태스크 오류)

### 데이터 정합성 검증
- 총 이관 행: 24,523,891건
- 검증 완료: 28개 테이블
- 정합성 통과: 25개 (89.3%)
- 불일치: 3개 (진행 중인 테이블 + 실패 테이블)

### DMS 성능
- 평균 처리량: 12,450 rows/sec
- 최대 처리량: 18,200 rows/sec
- CDC 지연: < 3초`,
  },
  {
    title: '남은 작업 및 권고사항 (Remaining Work)',
    content: `### 즉시 조치 필요 항목
1. **sql-006**: TIMESTAMP vs DATE 타입 불일치 수정 (attendance_date::DATE 캐스팅)
2. **sql-018**: INTERVAL 바인드 변수 이슈 해결 (Java 코드에서 INTERVAL 문자열 생성)
3. **COMMON.AUDIT_LOG**: DMS 태스크 재시작 및 데이터 재이관

### 수동 검토 필요 항목
4. **PKG_FIN.FN_CALC_TAX**: DBMS_SQL 동적 커서를 PL/pgSQL로 재작성
5. **VW_GL_BALANCE_SHEET**: 복잡한 CONNECT BY 뷰를 WITH RECURSIVE로 변환
6. **DBLINK_LEGACY_SYSTEM**: postgres_fdw 외부 서버 구성 및 테스트
7. **TYPE_ORDER_LINE_TAB**: 중첩 TABLE 타입을 PostgreSQL 배열 또는 JSONB로 재설계

### 성능 최적화 권고
8. Function-based 인덱스 4개를 PostgreSQL expression 인덱스로 재생성
9. Materialized View refresh 스케줄 설정 (pg_cron 사용 권장)
10. 대용량 테이블(ORDER_ITEMS, GL_JOURNAL_ENTRIES) 파티셔닝 검토`,
  },
];
