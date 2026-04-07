// App Migration mock data for OMA WebUI v2

export const mapperFiles = [
  { path: 'src/main/resources/mapper/com/example/hr/EmployeeMapper.xml', fileName: 'EmployeeMapper.xml', selectCount: 12, insertCount: 3, updateCount: 5, deleteCount: 2, totalSql: 22 },
  { path: 'src/main/resources/mapper/com/example/hr/DepartmentMapper.xml', fileName: 'DepartmentMapper.xml', selectCount: 8, insertCount: 2, updateCount: 3, deleteCount: 1, totalSql: 14 },
  { path: 'src/main/resources/mapper/com/example/hr/JobHistoryMapper.xml', fileName: 'JobHistoryMapper.xml', selectCount: 6, insertCount: 1, updateCount: 2, deleteCount: 1, totalSql: 10 },
  { path: 'src/main/resources/mapper/com/example/hr/AttendanceMapper.xml', fileName: 'AttendanceMapper.xml', selectCount: 9, insertCount: 2, updateCount: 4, deleteCount: 1, totalSql: 16 },
  { path: 'src/main/resources/mapper/com/example/sales/OrderMapper.xml', fileName: 'OrderMapper.xml', selectCount: 15, insertCount: 4, updateCount: 6, deleteCount: 2, totalSql: 27 },
  { path: 'src/main/resources/mapper/com/example/sales/OrderItemMapper.xml', fileName: 'OrderItemMapper.xml', selectCount: 8, insertCount: 3, updateCount: 2, deleteCount: 2, totalSql: 15 },
  { path: 'src/main/resources/mapper/com/example/sales/CustomerMapper.xml', fileName: 'CustomerMapper.xml', selectCount: 10, insertCount: 2, updateCount: 4, deleteCount: 1, totalSql: 17 },
  { path: 'src/main/resources/mapper/com/example/sales/ProductMapper.xml', fileName: 'ProductMapper.xml', selectCount: 7, insertCount: 2, updateCount: 3, deleteCount: 1, totalSql: 13 },
  { path: 'src/main/resources/mapper/com/example/sales/PromotionMapper.xml', fileName: 'PromotionMapper.xml', selectCount: 5, insertCount: 1, updateCount: 2, deleteCount: 1, totalSql: 9 },
  { path: 'src/main/resources/mapper/com/example/fin/JournalEntryMapper.xml', fileName: 'JournalEntryMapper.xml', selectCount: 11, insertCount: 3, updateCount: 4, deleteCount: 1, totalSql: 19 },
  { path: 'src/main/resources/mapper/com/example/fin/InvoiceMapper.xml', fileName: 'InvoiceMapper.xml', selectCount: 9, insertCount: 2, updateCount: 5, deleteCount: 1, totalSql: 17 },
  { path: 'src/main/resources/mapper/com/example/fin/PaymentMapper.xml', fileName: 'PaymentMapper.xml', selectCount: 7, insertCount: 2, updateCount: 3, deleteCount: 1, totalSql: 13 },
  { path: 'src/main/resources/mapper/com/example/fin/BudgetMapper.xml', fileName: 'BudgetMapper.xml', selectCount: 6, insertCount: 1, updateCount: 2, deleteCount: 0, totalSql: 9 },
  { path: 'src/main/resources/mapper/com/example/inv/InventoryMapper.xml', fileName: 'InventoryMapper.xml', selectCount: 8, insertCount: 2, updateCount: 4, deleteCount: 1, totalSql: 15 },
  { path: 'src/main/resources/mapper/com/example/inv/WarehouseMapper.xml', fileName: 'WarehouseMapper.xml', selectCount: 5, insertCount: 1, updateCount: 3, deleteCount: 1, totalSql: 10 },
  { path: 'src/main/resources/mapper/com/example/inv/StockTransferMapper.xml', fileName: 'StockTransferMapper.xml', selectCount: 6, insertCount: 2, updateCount: 2, deleteCount: 1, totalSql: 11 },
  { path: 'src/main/resources/mapper/com/example/crm/ContactMapper.xml', fileName: 'ContactMapper.xml', selectCount: 7, insertCount: 2, updateCount: 3, deleteCount: 1, totalSql: 13 },
  { path: 'src/main/resources/mapper/com/example/crm/OpportunityMapper.xml', fileName: 'OpportunityMapper.xml', selectCount: 9, insertCount: 2, updateCount: 4, deleteCount: 1, totalSql: 16 },
  { path: 'src/main/resources/mapper/com/example/crm/CampaignMapper.xml', fileName: 'CampaignMapper.xml', selectCount: 4, insertCount: 1, updateCount: 2, deleteCount: 1, totalSql: 8 },
  { path: 'src/main/resources/mapper/com/example/common/CodeMapper.xml', fileName: 'CodeMapper.xml', selectCount: 6, insertCount: 1, updateCount: 1, deleteCount: 0, totalSql: 8 },
  { path: 'src/main/resources/mapper/com/example/common/SequenceMapper.xml', fileName: 'SequenceMapper.xml', selectCount: 3, insertCount: 0, updateCount: 0, deleteCount: 0, totalSql: 3 },
  { path: 'src/main/resources/mapper/com/example/report/SalesReportMapper.xml', fileName: 'SalesReportMapper.xml', selectCount: 14, insertCount: 0, updateCount: 0, deleteCount: 0, totalSql: 14 },
];

export const extractedSqls = [
  // NVL patterns
  { id: 'sql-001', mapperId: 'EmployeeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT employee_id, first_name, last_name, NVL(commission_pct, 0) AS commission FROM hr.employees WHERE department_id = #{deptId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },
  { id: 'sql-002', mapperId: 'OrderMapper', sqlType: 'SELECT' as const, originalSql: "SELECT order_id, NVL(total_amount, 0) AS total, NVL(discount_amount, 0) AS discount FROM sales.orders WHERE customer_id = #{custId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },
  { id: 'sql-003', mapperId: 'InvoiceMapper', sqlType: 'SELECT' as const, originalSql: "SELECT invoice_id, NVL(paid_amount, 0) AS paid, NVL(balance_amount, invoice_amount) AS balance FROM fin.ap_invoices WHERE vendor_id = #{vendorId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },

  // SYSDATE patterns
  { id: 'sql-004', mapperId: 'OrderMapper', sqlType: 'INSERT' as const, originalSql: "INSERT INTO sales.orders (order_id, customer_id, order_date, status, created_date) VALUES (seq_order_id.NEXTVAL, #{customerId}, SYSDATE, 'PENDING', SYSDATE)", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },
  { id: 'sql-005', mapperId: 'EmployeeMapper', sqlType: 'UPDATE' as const, originalSql: "UPDATE hr.employees SET salary = #{newSalary}, updated_date = SYSDATE WHERE employee_id = #{empId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },
  { id: 'sql-006', mapperId: 'AttendanceMapper', sqlType: 'SELECT' as const, originalSql: "SELECT * FROM hr.attendance WHERE attendance_date = TRUNC(SYSDATE) AND employee_id = #{empId}", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // ROWNUM patterns
  { id: 'sql-007', mapperId: 'CustomerMapper', sqlType: 'SELECT' as const, originalSql: "SELECT * FROM (SELECT c.*, ROWNUM rn FROM sales.customers c WHERE region = #{region} ORDER BY customer_name) WHERE rn BETWEEN #{start} AND #{end}", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },
  { id: 'sql-008', mapperId: 'OrderMapper', sqlType: 'SELECT' as const, originalSql: "SELECT * FROM sales.orders WHERE status = 'PENDING' AND ROWNUM <= 100 ORDER BY order_date DESC", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },
  { id: 'sql-009', mapperId: 'SalesReportMapper', sqlType: 'SELECT' as const, originalSql: "SELECT * FROM (SELECT product_id, SUM(quantity) AS total_qty, ROWNUM AS rn FROM sales.order_items GROUP BY product_id ORDER BY total_qty DESC) WHERE ROWNUM <= 10", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },

  // DECODE patterns
  { id: 'sql-010', mapperId: 'OrderMapper', sqlType: 'SELECT' as const, originalSql: "SELECT order_id, DECODE(status, 'PENDING', '대기', 'SHIPPED', '배송중', 'DELIVERED', '완료', 'CANCELLED', '취소', '기타') AS status_name FROM sales.orders WHERE order_date >= #{startDate}", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },
  { id: 'sql-011', mapperId: 'EmployeeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT employee_id, DECODE(job_id, 'MGR', salary * 1.2, 'DIR', salary * 1.5, 'VP', salary * 2.0, salary) AS adjusted_salary FROM hr.employees", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // CONNECT BY (hierarchical)
  { id: 'sql-012', mapperId: 'DepartmentMapper', sqlType: 'SELECT' as const, originalSql: "SELECT department_id, department_name, LEVEL, SYS_CONNECT_BY_PATH(department_name, '/') AS path FROM hr.departments START WITH parent_dept_id IS NULL CONNECT BY PRIOR department_id = parent_dept_id ORDER SIBLINGS BY department_name", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },
  { id: 'sql-013', mapperId: 'EmployeeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT employee_id, first_name, last_name, manager_id, LEVEL AS org_level FROM hr.employees START WITH manager_id IS NULL CONNECT BY PRIOR employee_id = manager_id", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },

  // Sequence NEXTVAL/CURRVAL
  { id: 'sql-014', mapperId: 'OrderItemMapper', sqlType: 'INSERT' as const, originalSql: "INSERT INTO sales.order_items (item_id, order_id, product_id, quantity, unit_price) VALUES (seq_item_id.NEXTVAL, #{orderId}, #{productId}, #{quantity}, #{unitPrice})", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },
  { id: 'sql-015', mapperId: 'SequenceMapper', sqlType: 'SELECT' as const, originalSql: "SELECT seq_order_id.NEXTVAL FROM DUAL", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },

  // TO_DATE / TO_CHAR Oracle functions
  { id: 'sql-016', mapperId: 'SalesReportMapper', sqlType: 'SELECT' as const, originalSql: "SELECT TO_CHAR(order_date, 'YYYY-MM') AS month, SUM(total_amount) AS monthly_total FROM sales.orders WHERE order_date BETWEEN TO_DATE(#{startDate}, 'YYYY-MM-DD') AND TO_DATE(#{endDate}, 'YYYY-MM-DD') GROUP BY TO_CHAR(order_date, 'YYYY-MM')", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // Dynamic tags with Oracle-specific SQL
  { id: 'sql-017', mapperId: 'CustomerMapper', sqlType: 'SELECT' as const, originalSql: "SELECT customer_id, customer_name, NVL(email, 'N/A') AS email FROM sales.customers WHERE 1=1 <if test='name != null'>AND customer_name LIKE '%' || #{name} || '%'</if> <if test='region != null'>AND region = #{region}</if> AND ROWNUM <= #{limit}", hasDynamicTags: true, complexity: 'High' as const, oracleSpecific: true },
  { id: 'sql-018', mapperId: 'OrderMapper', sqlType: 'SELECT' as const, originalSql: "SELECT o.order_id, o.order_date, NVL(o.total_amount, 0) AS total FROM sales.orders o WHERE o.order_date >= ADD_MONTHS(SYSDATE, -#{months}) <choose><when test='status != null'>AND o.status = #{status}</when><otherwise>AND o.status != 'CANCELLED'</otherwise></choose>", hasDynamicTags: true, complexity: 'High' as const, oracleSpecific: true },

  // String concatenation (||)
  { id: 'sql-019', mapperId: 'EmployeeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT employee_id, first_name || ' ' || last_name AS full_name, email FROM hr.employees WHERE department_id = #{deptId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },

  // DUAL table
  { id: 'sql-020', mapperId: 'CodeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT SYSDATE AS current_date, USER AS current_user FROM DUAL", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },

  // MINUS (Oracle-specific set operator)
  { id: 'sql-021', mapperId: 'SalesReportMapper', sqlType: 'SELECT' as const, originalSql: "SELECT product_id FROM sales.products MINUS SELECT DISTINCT product_id FROM sales.order_items WHERE order_date >= ADD_MONTHS(SYSDATE, -6)", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // NVL2
  { id: 'sql-022', mapperId: 'EmployeeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT employee_id, NVL2(commission_pct, salary + (salary * commission_pct), salary) AS total_comp FROM hr.employees WHERE department_id = #{deptId}", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // (+) outer join syntax
  { id: 'sql-023', mapperId: 'JournalEntryMapper', sqlType: 'SELECT' as const, originalSql: "SELECT j.journal_id, j.amount, a.account_name FROM fin.gl_journal_entries j, fin.gl_accounts a WHERE j.account_id = a.account_id(+) AND j.period_id = #{periodId}", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // LISTAGG
  { id: 'sql-024', mapperId: 'DepartmentMapper', sqlType: 'SELECT' as const, originalSql: "SELECT department_id, LISTAGG(first_name || ' ' || last_name, ', ') WITHIN GROUP (ORDER BY last_name) AS employees FROM hr.employees GROUP BY department_id", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // WM_CONCAT equivalent
  { id: 'sql-025', mapperId: 'ProductMapper', sqlType: 'SELECT' as const, originalSql: "SELECT category_id, WM_CONCAT(product_name) AS product_list FROM sales.products GROUP BY category_id", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // SUBSTR with Oracle conventions
  { id: 'sql-026', mapperId: 'CodeMapper', sqlType: 'SELECT' as const, originalSql: "SELECT code_id, SUBSTR(code_name, 1, 20) AS short_name, NVL(description, code_name) AS display_name FROM common.codes WHERE code_group = #{codeGroup}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },

  // Complex WITH clause + Oracle functions
  { id: 'sql-027', mapperId: 'SalesReportMapper', sqlType: 'SELECT' as const, originalSql: "WITH monthly_sales AS (SELECT TO_CHAR(o.order_date, 'YYYY-MM') AS month, c.region, SUM(o.total_amount) AS total FROM sales.orders o JOIN sales.customers c ON o.customer_id = c.customer_id WHERE o.order_date >= ADD_MONTHS(SYSDATE, -12) GROUP BY TO_CHAR(o.order_date, 'YYYY-MM'), c.region) SELECT month, region, total, RANK() OVER (PARTITION BY month ORDER BY total DESC) AS rank FROM monthly_sales", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },

  // Merge statement
  { id: 'sql-028', mapperId: 'InventoryMapper', sqlType: 'UPDATE' as const, originalSql: "MERGE INTO inv.warehouse_stock ws USING (SELECT #{itemId} AS item_id, #{warehouseCode} AS wh_code, #{quantity} AS qty FROM DUAL) src ON (ws.item_id = src.item_id AND ws.warehouse_code = src.wh_code) WHEN MATCHED THEN UPDATE SET ws.quantity = ws.quantity + src.qty, ws.last_updated = SYSDATE WHEN NOT MATCHED THEN INSERT (item_id, warehouse_code, quantity, last_updated) VALUES (src.item_id, src.wh_code, src.qty, SYSDATE)", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },

  // Standard SQL (no conversion needed)
  { id: 'sql-029', mapperId: 'ContactMapper', sqlType: 'SELECT' as const, originalSql: "SELECT contact_id, first_name, last_name, email, phone FROM crm.contacts WHERE account_id = #{accountId} ORDER BY last_name", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },
  { id: 'sql-030', mapperId: 'OpportunityMapper', sqlType: 'UPDATE' as const, originalSql: "UPDATE crm.opportunities SET stage = #{stage}, probability = #{probability} WHERE opportunity_id = #{oppId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },
  { id: 'sql-031', mapperId: 'ContactMapper', sqlType: 'INSERT' as const, originalSql: "INSERT INTO crm.contacts (contact_id, first_name, last_name, email, phone, account_id) VALUES (#{contactId}, #{firstName}, #{lastName}, #{email}, #{phone}, #{accountId})", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },
  { id: 'sql-032', mapperId: 'ProductMapper', sqlType: 'DELETE' as const, originalSql: "DELETE FROM sales.products WHERE product_id = #{productId} AND status = 'INACTIVE'", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },

  // More Oracle-specific patterns
  { id: 'sql-033', mapperId: 'PaymentMapper', sqlType: 'SELECT' as const, originalSql: "SELECT payment_id, TO_CHAR(payment_date, 'YYYY/MM/DD') AS pay_date, NVL(memo, '메모 없음') AS memo, DECODE(payment_type, 'CASH', '현금', 'CARD', '카드', 'TRANSFER', '이체', '기타') AS type_name FROM fin.payments WHERE invoice_id = #{invoiceId}", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },
  { id: 'sql-034', mapperId: 'BudgetMapper', sqlType: 'SELECT' as const, originalSql: "SELECT fiscal_year, department_id, NVL(SUM(budget_amount), 0) AS total_budget, NVL(SUM(actual_amount), 0) AS total_actual, ROUND(NVL(SUM(actual_amount), 0) / NULLIF(NVL(SUM(budget_amount), 0), 0) * 100, 2) AS utilization_pct FROM fin.budgets WHERE fiscal_year = #{year} GROUP BY fiscal_year, department_id", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },
  { id: 'sql-035', mapperId: 'StockTransferMapper', sqlType: 'INSERT' as const, originalSql: "INSERT INTO inv.stock_transfers (transfer_id, item_id, from_warehouse, to_warehouse, quantity, status, created_date) VALUES (seq_transfer_id.NEXTVAL, #{itemId}, #{fromWarehouse}, #{toWarehouse}, #{quantity}, 'PENDING', SYSDATE)", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // Dynamic SQL with foreach
  { id: 'sql-036', mapperId: 'OrderMapper', sqlType: 'SELECT' as const, originalSql: "SELECT order_id, customer_id, NVL(total_amount, 0) AS total, order_date FROM sales.orders WHERE status IN <foreach item='item' collection='statusList' open='(' separator=',' close=')'>#{item}</foreach> AND order_date >= SYSDATE - #{days}", hasDynamicTags: true, complexity: 'Medium' as const, oracleSpecific: true },
  { id: 'sql-037', mapperId: 'InventoryMapper', sqlType: 'SELECT' as const, originalSql: "SELECT i.item_id, i.item_name, NVL(ws.quantity, 0) AS stock_qty FROM inv.inventory_items i LEFT JOIN inv.warehouse_stock ws ON i.item_id = ws.item_id AND ws.warehouse_code = #{warehouseCode} WHERE i.category_id = #{categoryId} ORDER BY i.item_name", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: true },

  // REGEXP Oracle functions
  { id: 'sql-038', mapperId: 'CustomerMapper', sqlType: 'SELECT' as const, originalSql: "SELECT customer_id, customer_name, email FROM sales.customers WHERE REGEXP_LIKE(phone_number, '^010-[0-9]{4}-[0-9]{4}$')", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // EXTRACT with Oracle date
  { id: 'sql-039', mapperId: 'SalesReportMapper', sqlType: 'SELECT' as const, originalSql: "SELECT EXTRACT(YEAR FROM order_date) AS year, EXTRACT(MONTH FROM order_date) AS month, COUNT(*) AS order_count, SUM(NVL(total_amount, 0)) AS revenue FROM sales.orders GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date) ORDER BY year DESC, month DESC", hasDynamicTags: false, complexity: 'Medium' as const, oracleSpecific: true },

  // Complex dynamic query
  { id: 'sql-040', mapperId: 'OpportunityMapper', sqlType: 'SELECT' as const, originalSql: "SELECT o.opportunity_id, o.opportunity_name, NVL(o.amount, 0) AS amount, c.customer_name, DECODE(o.stage, 'PROSPECTING', '발굴', 'QUALIFICATION', '검증', 'PROPOSAL', '제안', 'NEGOTIATION', '협상', 'CLOSED_WON', '수주', 'CLOSED_LOST', '실주', '기타') AS stage_name FROM crm.opportunities o JOIN sales.customers c ON o.customer_id = c.customer_id WHERE 1=1 <if test='stage != null'>AND o.stage = #{stage}</if> <if test='minAmount != null'>AND NVL(o.amount, 0) >= #{minAmount}</if> <if test='assignedTo != null'>AND o.assigned_to = #{assignedTo}</if> ORDER BY o.close_date", hasDynamicTags: true, complexity: 'High' as const, oracleSpecific: true },

  // Analytic functions with Oracle syntax
  { id: 'sql-041', mapperId: 'SalesReportMapper', sqlType: 'SELECT' as const, originalSql: "SELECT customer_id, order_date, total_amount, SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total, LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_amount FROM sales.orders WHERE order_date >= ADD_MONTHS(SYSDATE, -3)", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },

  // DBMS_LOB
  { id: 'sql-042', mapperId: 'CampaignMapper', sqlType: 'SELECT' as const, originalSql: "SELECT campaign_id, campaign_name, DBMS_LOB.GETLENGTH(description) AS desc_length, DBMS_LOB.SUBSTR(description, 200, 1) AS short_desc FROM crm.campaigns WHERE status = 'ACTIVE'", hasDynamicTags: false, complexity: 'High' as const, oracleSpecific: true },

  // Standard SQL that doesn't need conversion
  { id: 'sql-043', mapperId: 'WarehouseMapper', sqlType: 'SELECT' as const, originalSql: "SELECT warehouse_code, warehouse_name, address, city, country FROM inv.warehouses WHERE active = true ORDER BY warehouse_name", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },
  { id: 'sql-044', mapperId: 'CampaignMapper', sqlType: 'DELETE' as const, originalSql: "DELETE FROM crm.campaign_members WHERE campaign_id = #{campaignId} AND member_id = #{memberId}", hasDynamicTags: false, complexity: 'Low' as const, oracleSpecific: false },
];

export const filterResults = {
  needsConversion: 34,
  newQuery: 0,
  noConversionNeeded: 10,
  items: [
    { sqlId: 'sql-001', category: 'needsConversion' as const, reason: 'NVL function → COALESCE' },
    { sqlId: 'sql-002', category: 'needsConversion' as const, reason: 'NVL function → COALESCE' },
    { sqlId: 'sql-003', category: 'needsConversion' as const, reason: 'NVL function → COALESCE' },
    { sqlId: 'sql-004', category: 'needsConversion' as const, reason: 'SYSDATE, NEXTVAL syntax' },
    { sqlId: 'sql-005', category: 'needsConversion' as const, reason: 'SYSDATE → CURRENT_TIMESTAMP' },
    { sqlId: 'sql-006', category: 'needsConversion' as const, reason: 'TRUNC(SYSDATE) → CURRENT_DATE' },
    { sqlId: 'sql-007', category: 'needsConversion' as const, reason: 'ROWNUM pagination → LIMIT/OFFSET' },
    { sqlId: 'sql-008', category: 'needsConversion' as const, reason: 'ROWNUM → LIMIT' },
    { sqlId: 'sql-009', category: 'needsConversion' as const, reason: 'ROWNUM → LIMIT with subquery' },
    { sqlId: 'sql-010', category: 'needsConversion' as const, reason: 'DECODE → CASE WHEN' },
    { sqlId: 'sql-011', category: 'needsConversion' as const, reason: 'DECODE → CASE WHEN' },
    { sqlId: 'sql-012', category: 'needsConversion' as const, reason: 'CONNECT BY → WITH RECURSIVE' },
    { sqlId: 'sql-013', category: 'needsConversion' as const, reason: 'CONNECT BY → WITH RECURSIVE' },
    { sqlId: 'sql-014', category: 'needsConversion' as const, reason: 'NEXTVAL syntax change' },
    { sqlId: 'sql-015', category: 'needsConversion' as const, reason: 'DUAL table, NEXTVAL syntax' },
    { sqlId: 'sql-016', category: 'needsConversion' as const, reason: 'TO_DATE format compatible but needs review' },
    { sqlId: 'sql-017', category: 'needsConversion' as const, reason: 'NVL, ROWNUM, dynamic tags' },
    { sqlId: 'sql-018', category: 'needsConversion' as const, reason: 'NVL, ADD_MONTHS, SYSDATE' },
    { sqlId: 'sql-019', category: 'noConversionNeeded' as const, reason: '|| concatenation works in PostgreSQL' },
    { sqlId: 'sql-020', category: 'needsConversion' as const, reason: 'DUAL table, SYSDATE, USER' },
    { sqlId: 'sql-021', category: 'needsConversion' as const, reason: 'MINUS → EXCEPT, ADD_MONTHS' },
    { sqlId: 'sql-022', category: 'needsConversion' as const, reason: 'NVL2 → CASE WHEN' },
    { sqlId: 'sql-023', category: 'needsConversion' as const, reason: '(+) outer join → LEFT JOIN' },
    { sqlId: 'sql-024', category: 'needsConversion' as const, reason: 'LISTAGG → STRING_AGG' },
    { sqlId: 'sql-025', category: 'needsConversion' as const, reason: 'WM_CONCAT → STRING_AGG' },
    { sqlId: 'sql-026', category: 'needsConversion' as const, reason: 'NVL → COALESCE' },
    { sqlId: 'sql-027', category: 'needsConversion' as const, reason: 'ADD_MONTHS, SYSDATE' },
    { sqlId: 'sql-028', category: 'needsConversion' as const, reason: 'MERGE → INSERT ON CONFLICT, DUAL, SYSDATE' },
    { sqlId: 'sql-029', category: 'noConversionNeeded' as const, reason: 'Standard SQL' },
    { sqlId: 'sql-030', category: 'noConversionNeeded' as const, reason: 'Standard SQL' },
    { sqlId: 'sql-031', category: 'noConversionNeeded' as const, reason: 'Standard SQL' },
    { sqlId: 'sql-032', category: 'noConversionNeeded' as const, reason: 'Standard SQL' },
    { sqlId: 'sql-033', category: 'needsConversion' as const, reason: 'TO_CHAR, NVL, DECODE' },
    { sqlId: 'sql-034', category: 'needsConversion' as const, reason: 'NVL → COALESCE' },
    { sqlId: 'sql-035', category: 'needsConversion' as const, reason: 'NEXTVAL syntax, SYSDATE' },
    { sqlId: 'sql-036', category: 'needsConversion' as const, reason: 'NVL, SYSDATE arithmetic' },
    { sqlId: 'sql-037', category: 'needsConversion' as const, reason: 'NVL → COALESCE' },
    { sqlId: 'sql-038', category: 'needsConversion' as const, reason: 'REGEXP_LIKE → ~ operator' },
    { sqlId: 'sql-039', category: 'needsConversion' as const, reason: 'NVL → COALESCE (EXTRACT is compatible)' },
    { sqlId: 'sql-040', category: 'needsConversion' as const, reason: 'NVL, DECODE, dynamic tags' },
    { sqlId: 'sql-041', category: 'needsConversion' as const, reason: 'ADD_MONTHS, SYSDATE' },
    { sqlId: 'sql-042', category: 'needsConversion' as const, reason: 'DBMS_LOB → LENGTH/SUBSTRING' },
    { sqlId: 'sql-043', category: 'noConversionNeeded' as const, reason: 'Standard SQL' },
    { sqlId: 'sql-044', category: 'noConversionNeeded' as const, reason: 'Standard SQL' },
  ],
};

export const queryRewriteResults = [
  {
    sqlId: 'sql-001',
    originalSql: "SELECT employee_id, first_name, last_name, NVL(commission_pct, 0) AS commission FROM hr.employees WHERE department_id = #{deptId}",
    convertedSql: "SELECT employee_id, first_name, last_name, COALESCE(commission_pct, 0) AS commission FROM hr.employees WHERE department_id = #{deptId}",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 45, matchesOriginal: true },
    retryCount: 0,
    rules: ['NVL→COALESCE'],
  },
  {
    sqlId: 'sql-004',
    originalSql: "INSERT INTO sales.orders (order_id, customer_id, order_date, status, created_date) VALUES (seq_order_id.NEXTVAL, #{customerId}, SYSDATE, 'PENDING', SYSDATE)",
    convertedSql: "INSERT INTO sales.orders (order_id, customer_id, order_date, status, created_date) VALUES (nextval('sales.seq_order_id'), #{customerId}, CURRENT_TIMESTAMP, 'PENDING', CURRENT_TIMESTAMP)",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 1, matchesOriginal: true },
    retryCount: 0,
    rules: ['NEXTVAL→nextval()', 'SYSDATE→CURRENT_TIMESTAMP'],
  },
  {
    sqlId: 'sql-007',
    originalSql: "SELECT * FROM (SELECT c.*, ROWNUM rn FROM sales.customers c WHERE region = #{region} ORDER BY customer_name) WHERE rn BETWEEN #{start} AND #{end}",
    convertedSql: "SELECT * FROM sales.customers WHERE region = #{region} ORDER BY customer_name LIMIT #{end} - #{start} + 1 OFFSET #{start} - 1",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 20, matchesOriginal: true },
    retryCount: 1,
    rules: ['ROWNUM pagination→LIMIT/OFFSET'],
    agentLog: 'First attempt used incorrect OFFSET calculation. Retry corrected to #{start} - 1.',
  },
  {
    sqlId: 'sql-008',
    originalSql: "SELECT * FROM sales.orders WHERE status = 'PENDING' AND ROWNUM <= 100 ORDER BY order_date DESC",
    convertedSql: "SELECT * FROM sales.orders WHERE status = 'PENDING' ORDER BY order_date DESC LIMIT 100",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 100, matchesOriginal: true },
    retryCount: 0,
    rules: ['ROWNUM→LIMIT', 'ORDER BY repositioned'],
  },
  {
    sqlId: 'sql-010',
    originalSql: "SELECT order_id, DECODE(status, 'PENDING', '대기', 'SHIPPED', '배송중', 'DELIVERED', '완료', 'CANCELLED', '취소', '기타') AS status_name FROM sales.orders WHERE order_date >= #{startDate}",
    convertedSql: "SELECT order_id, CASE status WHEN 'PENDING' THEN '대기' WHEN 'SHIPPED' THEN '배송중' WHEN 'DELIVERED' THEN '완료' WHEN 'CANCELLED' THEN '취소' ELSE '기타' END AS status_name FROM sales.orders WHERE order_date >= #{startDate}",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 342, matchesOriginal: true },
    retryCount: 0,
    rules: ['DECODE→CASE WHEN'],
  },
  {
    sqlId: 'sql-012',
    originalSql: "SELECT department_id, department_name, LEVEL, SYS_CONNECT_BY_PATH(department_name, '/') AS path FROM hr.departments START WITH parent_dept_id IS NULL CONNECT BY PRIOR department_id = parent_dept_id ORDER SIBLINGS BY department_name",
    convertedSql: "WITH RECURSIVE dept_tree AS (\n  SELECT department_id, department_name, parent_dept_id, 1 AS level,\n    '/' || department_name AS path\n  FROM hr.departments\n  WHERE parent_dept_id IS NULL\n  UNION ALL\n  SELECT d.department_id, d.department_name, d.parent_dept_id, dt.level + 1,\n    dt.path || '/' || d.department_name\n  FROM hr.departments d\n  JOIN dept_tree dt ON d.parent_dept_id = dt.department_id\n)\nSELECT department_id, department_name, level, path\nFROM dept_tree\nORDER BY path",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 27, matchesOriginal: true },
    retryCount: 2,
    rules: ['CONNECT BY→WITH RECURSIVE', 'SYS_CONNECT_BY_PATH→string concatenation', 'LEVEL→recursive counter', 'ORDER SIBLINGS→ORDER BY path'],
    agentLog: 'Attempt 1: Missing UNION ALL anchor. Attempt 2: ORDER SIBLINGS incorrectly translated. Attempt 3: Correct WITH RECURSIVE with path-based ordering.',
  },
  {
    sqlId: 'sql-013',
    originalSql: "SELECT employee_id, first_name, last_name, manager_id, LEVEL AS org_level FROM hr.employees START WITH manager_id IS NULL CONNECT BY PRIOR employee_id = manager_id",
    convertedSql: "WITH RECURSIVE emp_tree AS (\n  SELECT employee_id, first_name, last_name, manager_id, 1 AS org_level\n  FROM hr.employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.first_name, e.last_name, e.manager_id, et.org_level + 1\n  FROM hr.employees e\n  JOIN emp_tree et ON e.manager_id = et.employee_id\n)\nSELECT employee_id, first_name, last_name, manager_id, org_level FROM emp_tree",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 107, matchesOriginal: true },
    retryCount: 0,
    rules: ['CONNECT BY→WITH RECURSIVE', 'LEVEL→recursive counter'],
  },
  {
    sqlId: 'sql-015',
    originalSql: "SELECT seq_order_id.NEXTVAL FROM DUAL",
    convertedSql: "SELECT nextval('sales.seq_order_id')",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 1, matchesOriginal: true },
    retryCount: 0,
    rules: ['NEXTVAL→nextval()', 'FROM DUAL removed'],
  },
  {
    sqlId: 'sql-020',
    originalSql: "SELECT SYSDATE AS current_date, USER AS current_user FROM DUAL",
    convertedSql: "SELECT CURRENT_TIMESTAMP AS current_date, current_user",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 1, matchesOriginal: true },
    retryCount: 0,
    rules: ['SYSDATE→CURRENT_TIMESTAMP', 'USER→current_user', 'FROM DUAL removed'],
  },
  {
    sqlId: 'sql-021',
    originalSql: "SELECT product_id FROM sales.products MINUS SELECT DISTINCT product_id FROM sales.order_items WHERE order_date >= ADD_MONTHS(SYSDATE, -6)",
    convertedSql: "SELECT product_id FROM sales.products EXCEPT SELECT DISTINCT product_id FROM sales.order_items WHERE order_date >= CURRENT_DATE - INTERVAL '6 months'",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 23, matchesOriginal: true },
    retryCount: 0,
    rules: ['MINUS→EXCEPT', 'ADD_MONTHS→INTERVAL', 'SYSDATE→CURRENT_DATE'],
  },
  {
    sqlId: 'sql-022',
    originalSql: "SELECT employee_id, NVL2(commission_pct, salary + (salary * commission_pct), salary) AS total_comp FROM hr.employees WHERE department_id = #{deptId}",
    convertedSql: "SELECT employee_id, CASE WHEN commission_pct IS NOT NULL THEN salary + (salary * commission_pct) ELSE salary END AS total_comp FROM hr.employees WHERE department_id = #{deptId}",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 45, matchesOriginal: true },
    retryCount: 0,
    rules: ['NVL2→CASE WHEN IS NOT NULL'],
  },
  {
    sqlId: 'sql-023',
    originalSql: "SELECT j.journal_id, j.amount, a.account_name FROM fin.gl_journal_entries j, fin.gl_accounts a WHERE j.account_id = a.account_id(+) AND j.period_id = #{periodId}",
    convertedSql: "SELECT j.journal_id, j.amount, a.account_name FROM fin.gl_journal_entries j LEFT JOIN fin.gl_accounts a ON j.account_id = a.account_id WHERE j.period_id = #{periodId}",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 1250, matchesOriginal: true },
    retryCount: 0,
    rules: ['(+) outer join→LEFT JOIN'],
  },
  {
    sqlId: 'sql-024',
    originalSql: "SELECT department_id, LISTAGG(first_name || ' ' || last_name, ', ') WITHIN GROUP (ORDER BY last_name) AS employees FROM hr.employees GROUP BY department_id",
    convertedSql: "SELECT department_id, STRING_AGG(first_name || ' ' || last_name, ', ' ORDER BY last_name) AS employees FROM hr.employees GROUP BY department_id",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 27, matchesOriginal: true },
    retryCount: 0,
    rules: ['LISTAGG WITHIN GROUP→STRING_AGG with ORDER BY'],
  },
  {
    sqlId: 'sql-028',
    originalSql: "MERGE INTO inv.warehouse_stock ws USING (SELECT #{itemId} AS item_id, #{warehouseCode} AS wh_code, #{quantity} AS qty FROM DUAL) src ON (ws.item_id = src.item_id AND ws.warehouse_code = src.wh_code) WHEN MATCHED THEN UPDATE SET ws.quantity = ws.quantity + src.qty, ws.last_updated = SYSDATE WHEN NOT MATCHED THEN INSERT (item_id, warehouse_code, quantity, last_updated) VALUES (src.item_id, src.wh_code, src.qty, SYSDATE)",
    convertedSql: "INSERT INTO inv.warehouse_stock (item_id, warehouse_code, quantity, last_updated)\nVALUES (#{itemId}, #{warehouseCode}, #{quantity}, CURRENT_TIMESTAMP)\nON CONFLICT (item_id, warehouse_code)\nDO UPDATE SET quantity = inv.warehouse_stock.quantity + EXCLUDED.quantity,\n  last_updated = CURRENT_TIMESTAMP",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 1, matchesOriginal: true },
    retryCount: 1,
    rules: ['MERGE→INSERT ON CONFLICT', 'FROM DUAL removed', 'SYSDATE→CURRENT_TIMESTAMP'],
    agentLog: 'First attempt generated incorrect ON CONFLICT syntax. Retry fixed to use proper EXCLUDED reference.',
  },
  {
    sqlId: 'sql-038',
    originalSql: "SELECT customer_id, customer_name, email FROM sales.customers WHERE REGEXP_LIKE(phone_number, '^010-[0-9]{4}-[0-9]{4}$')",
    convertedSql: "SELECT customer_id, customer_name, email FROM sales.customers WHERE phone_number ~ '^010-[0-9]{4}-[0-9]{4}$'",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 892, matchesOriginal: true },
    retryCount: 0,
    rules: ['REGEXP_LIKE→~ operator'],
  },
  {
    sqlId: 'sql-042',
    originalSql: "SELECT campaign_id, campaign_name, DBMS_LOB.GETLENGTH(description) AS desc_length, DBMS_LOB.SUBSTR(description, 200, 1) AS short_desc FROM crm.campaigns WHERE status = 'ACTIVE'",
    convertedSql: "SELECT campaign_id, campaign_name, LENGTH(description) AS desc_length, SUBSTRING(description FROM 1 FOR 200) AS short_desc FROM crm.campaigns WHERE status = 'ACTIVE'",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 15, matchesOriginal: true },
    retryCount: 0,
    rules: ['DBMS_LOB.GETLENGTH→LENGTH', 'DBMS_LOB.SUBSTR→SUBSTRING'],
  },
  {
    sqlId: 'sql-017',
    originalSql: "SELECT customer_id, customer_name, NVL(email, 'N/A') AS email FROM sales.customers WHERE 1=1 <if test='name != null'>AND customer_name LIKE '%' || #{name} || '%'</if> <if test='region != null'>AND region = #{region}</if> AND ROWNUM <= #{limit}",
    convertedSql: "SELECT customer_id, customer_name, COALESCE(email, 'N/A') AS email FROM sales.customers WHERE 1=1 <if test='name != null'>AND customer_name LIKE '%' || #{name} || '%'</if> <if test='region != null'>AND region = #{region}</if> LIMIT #{limit}",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 50, matchesOriginal: true },
    retryCount: 1,
    rules: ['NVL→COALESCE', 'ROWNUM→LIMIT', 'Dynamic tags preserved'],
    agentLog: 'Dynamic tags preserved during conversion. ROWNUM clause moved to LIMIT at end.',
  },
  {
    sqlId: 'sql-018',
    originalSql: "SELECT o.order_id, o.order_date, NVL(o.total_amount, 0) AS total FROM sales.orders o WHERE o.order_date >= ADD_MONTHS(SYSDATE, -#{months}) <choose><when test='status != null'>AND o.status = #{status}</when><otherwise>AND o.status != 'CANCELLED'</otherwise></choose>",
    convertedSql: "SELECT o.order_id, o.order_date, COALESCE(o.total_amount, 0) AS total FROM sales.orders o WHERE o.order_date >= CURRENT_DATE - (#{months} || ' months')::INTERVAL <choose><when test='status != null'>AND o.status = #{status}</when><otherwise>AND o.status != 'CANCELLED'</otherwise></choose>",
    status: 'retry' as const,
    retryCount: 2,
    rules: ['NVL→COALESCE', 'ADD_MONTHS→INTERVAL cast', 'Dynamic tags preserved'],
    agentLog: 'INTERVAL cast with bind variable causing parse error in MyBatis. Investigating alternative approach.',
  },
  {
    sqlId: 'sql-040',
    originalSql: "SELECT o.opportunity_id, o.opportunity_name, NVL(o.amount, 0) AS amount, c.customer_name, DECODE(o.stage, 'PROSPECTING', '발굴', 'QUALIFICATION', '검증', 'PROPOSAL', '제안', 'NEGOTIATION', '협상', 'CLOSED_WON', '수주', 'CLOSED_LOST', '실주', '기타') AS stage_name FROM crm.opportunities o JOIN sales.customers c ON o.customer_id = c.customer_id WHERE 1=1 <if test='stage != null'>AND o.stage = #{stage}</if> <if test='minAmount != null'>AND NVL(o.amount, 0) >= #{minAmount}</if> <if test='assignedTo != null'>AND o.assigned_to = #{assignedTo}</if> ORDER BY o.close_date",
    convertedSql: "SELECT o.opportunity_id, o.opportunity_name, COALESCE(o.amount, 0) AS amount, c.customer_name, CASE o.stage WHEN 'PROSPECTING' THEN '발굴' WHEN 'QUALIFICATION' THEN '검증' WHEN 'PROPOSAL' THEN '제안' WHEN 'NEGOTIATION' THEN '협상' WHEN 'CLOSED_WON' THEN '수주' WHEN 'CLOSED_LOST' THEN '실주' ELSE '기타' END AS stage_name FROM crm.opportunities o JOIN sales.customers c ON o.customer_id = c.customer_id WHERE 1=1 <if test='stage != null'>AND o.stage = #{stage}</if> <if test='minAmount != null'>AND COALESCE(o.amount, 0) >= #{minAmount}</if> <if test='assignedTo != null'>AND o.assigned_to = #{assignedTo}</if> ORDER BY o.close_date",
    status: 'pass' as const,
    testResult: { executed: true, rowCount: 67, matchesOriginal: true },
    retryCount: 0,
    rules: ['NVL→COALESCE', 'DECODE→CASE WHEN', 'Dynamic tags preserved'],
  },
  {
    sqlId: 'sql-006',
    originalSql: "SELECT * FROM hr.attendance WHERE attendance_date = TRUNC(SYSDATE) AND employee_id = #{empId}",
    convertedSql: "SELECT * FROM hr.attendance WHERE attendance_date = CURRENT_DATE AND employee_id = #{empId}",
    status: 'fail' as const,
    testResult: { executed: true, rowCount: 0, matchesOriginal: false },
    retryCount: 3,
    rules: ['TRUNC(SYSDATE)→CURRENT_DATE'],
    agentLog: 'CURRENT_DATE returns date type but attendance_date is TIMESTAMP. Need explicit cast: attendance_date::DATE = CURRENT_DATE. Max retries reached.',
  },
];

export const xmlMergeResults = [
  { fileName: 'EmployeeMapper.xml', originalLines: 245, mergedLines: 248, changes: 8, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'DepartmentMapper.xml', originalLines: 156, mergedLines: 162, changes: 4, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'OrderMapper.xml', originalLines: 312, mergedLines: 320, changes: 12, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'OrderItemMapper.xml', originalLines: 178, mergedLines: 180, changes: 3, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'CustomerMapper.xml', originalLines: 198, mergedLines: 204, changes: 6, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'JournalEntryMapper.xml', originalLines: 223, mergedLines: 226, changes: 5, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'InvoiceMapper.xml', originalLines: 189, mergedLines: 192, changes: 4, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'InventoryMapper.xml', originalLines: 167, mergedLines: 172, changes: 5, validationStatus: 'pass' as const, hasJavaChanges: true },
  { fileName: 'OpportunityMapper.xml', originalLines: 201, mergedLines: 208, changes: 7, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'SalesReportMapper.xml', originalLines: 289, mergedLines: 301, changes: 10, validationStatus: 'warning' as const, hasJavaChanges: false },
  { fileName: 'PaymentMapper.xml', originalLines: 145, mergedLines: 148, changes: 3, validationStatus: 'pass' as const, hasJavaChanges: false },
  { fileName: 'CampaignMapper.xml', originalLines: 98, mergedLines: 100, changes: 2, validationStatus: 'pass' as const, hasJavaChanges: true },
];

export const testErrors = [
  {
    id: 'err-001',
    sqlId: 'sql-006',
    errorType: 'TYPE_MISMATCH',
    errorMessage: "operator does not exist: timestamp without time zone = date\nHint: No operator matches the given name and argument types.",
    mapperFile: 'AttendanceMapper.xml',
    fixStatus: 'fixed' as const,
    fixedSql: "SELECT * FROM hr.attendance WHERE attendance_date::DATE = CURRENT_DATE AND employee_id = #{empId}",
  },
  {
    id: 'err-002',
    sqlId: 'sql-018',
    errorType: 'SYNTAX_ERROR',
    errorMessage: "syntax error at or near \"||\" in INTERVAL expression with bind variable",
    mapperFile: 'OrderMapper.xml',
    fixStatus: 'pending' as const,
  },
  {
    id: 'err-003',
    sqlId: 'sql-009',
    errorType: 'SEMANTIC_ERROR',
    errorMessage: "column \"rn\" does not exist in outer query context",
    mapperFile: 'SalesReportMapper.xml',
    fixStatus: 'fixed' as const,
    fixedSql: "SELECT product_id, total_qty FROM (SELECT product_id, SUM(quantity) AS total_qty FROM sales.order_items GROUP BY product_id ORDER BY total_qty DESC) sub LIMIT 10",
  },
  {
    id: 'err-004',
    sqlId: 'sql-025',
    errorType: 'FUNCTION_NOT_FOUND',
    errorMessage: "function wm_concat(character varying) does not exist",
    mapperFile: 'ProductMapper.xml',
    fixStatus: 'fixed' as const,
    fixedSql: "SELECT category_id, STRING_AGG(product_name, ',') AS product_list FROM sales.products GROUP BY category_id",
  },
  {
    id: 'err-005',
    sqlId: 'sql-027',
    errorType: 'SYNTAX_ERROR',
    errorMessage: "syntax error in ADD_MONTHS conversion with INTERVAL expression",
    mapperFile: 'SalesReportMapper.xml',
    fixStatus: 'approved' as const,
    fixedSql: "WITH monthly_sales AS (SELECT TO_CHAR(o.order_date, 'YYYY-MM') AS month, c.region, SUM(o.total_amount) AS total FROM sales.orders o JOIN sales.customers c ON o.customer_id = c.customer_id WHERE o.order_date >= CURRENT_DATE - INTERVAL '12 months' GROUP BY TO_CHAR(o.order_date, 'YYYY-MM'), c.region) SELECT month, region, total, RANK() OVER (PARTITION BY month ORDER BY total DESC) AS rank FROM monthly_sales",
  },
  {
    id: 'err-006',
    sqlId: 'sql-036',
    errorType: 'SYNTAX_ERROR',
    errorMessage: "invalid input syntax for type interval: cannot use bind variable in date arithmetic",
    mapperFile: 'OrderMapper.xml',
    fixStatus: 'pending' as const,
  },
  {
    id: 'err-007',
    sqlId: 'sql-041',
    errorType: 'SEMANTIC_ERROR',
    errorMessage: "ADD_MONTHS function not found in PostgreSQL",
    mapperFile: 'SalesReportMapper.xml',
    fixStatus: 'fixed' as const,
    fixedSql: "SELECT customer_id, order_date, total_amount, SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total, LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_amount FROM sales.orders WHERE order_date >= CURRENT_DATE - INTERVAL '3 months'",
  },
];
