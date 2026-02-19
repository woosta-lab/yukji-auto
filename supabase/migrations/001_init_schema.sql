-- Users table (Owner only)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Standard Items (품목 마스터)
CREATE TABLE IF NOT EXISTS std_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  base_uom VARCHAR(50),
  is_liquor BOOLEAN DEFAULT FALSE,
  is_meat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Item Mapping
CREATE TABLE IF NOT EXISTS pos_item_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(100) NOT NULL,
  item_name VARCHAR(255),
  std_item_id UUID REFERENCES std_item(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_code)
);

-- POS Reports (업로드된 엑셀 파일 정보)
CREATE TABLE IF NOT EXISTS pos_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL, -- 'product_daily_item', 'product_hourly', 'payment_method', 'daily_summary'
  date_from DATE,
  date_to DATE,
  file_path VARCHAR(500),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Sales Daily Item (상품-일자별 매출, 핵심 테이블)
CREATE TABLE IF NOT EXISTS pos_sales_daily_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date DATE NOT NULL,
  item_code VARCHAR(100) NOT NULL,
  item_name VARCHAR(255),
  qty DECIMAL(10, 2) NOT NULL,
  net_sales DECIMAL(15, 2) NOT NULL,
  source_report_id UUID REFERENCES pos_reports(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pos_sales_daily_item_date ON pos_sales_daily_item(sale_date);
CREATE INDEX idx_pos_sales_daily_item_item_code ON pos_sales_daily_item(item_code);

-- Vendors (거래처)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices (명세서)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  issue_date DATE NOT NULL,
  total_amount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved'
  file_path VARCHAR(500),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP
);

-- Invoice Items (명세서 라인 아이템)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  raw_item_name VARCHAR(255) NOT NULL,
  qty DECIMAL(10, 2) NOT NULL,
  uom VARCHAR(50),
  unit_price DECIMAL(15, 2),
  line_total DECIMAL(15, 2),
  std_item_id UUID REFERENCES std_item(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Inventory Ledger (재고 원장)
CREATE TABLE IF NOT EXISTS inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  std_item_id UUID NOT NULL REFERENCES std_item(id),
  date DATE NOT NULL,
  qty_delta DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'inbound', 'sale', 'adjust'
  ref_type VARCHAR(50), -- 'invoice', 'pos_sale', 'manual'
  ref_id UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_ledger_item_date ON inventory_ledger(std_item_id, date);

-- Audit Log (감사 로그)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'upload', 'edit', 'approve', 'close'
  entity VARCHAR(100) NOT NULL, -- 'pos_report', 'invoice', 'pos_sales_daily_item'
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Daily Closing (일마감 기록)
CREATE TABLE IF NOT EXISTS daily_closing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  close_date DATE NOT NULL UNIQUE,
  closed_by UUID REFERENCES users(id),
  closed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE std_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sales_daily_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_closing ENABLE ROW LEVEL SECURITY;

-- RLS Policies (모든 사용자가 읽기 가능, 특정 사용자만 쓰기 가능)
CREATE POLICY "Allow all users to read" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON std_item FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON pos_item_map FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON pos_reports FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON pos_sales_daily_item FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON vendors FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON inventory_ledger FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON audit_log FOR SELECT USING (true);
CREATE POLICY "Allow all users to read" ON daily_closing FOR SELECT USING (true);
