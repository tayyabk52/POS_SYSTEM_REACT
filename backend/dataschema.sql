-- =============================================
-- Candela POS System Schema for PostgreSQL
-- (FBR integration removed)
-- Created: 2025
-- =============================================

-- Enable UUID extension for potential future use
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CORE ENTITIES
-- =============================================

-- Categories table (hierarchical)
CREATE TABLE categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    parent_category_id INTEGER REFERENCES categories(category_id),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE brands (
    brand_id    SERIAL PRIMARY KEY,
    brand_name  VARCHAR(100) UNIQUE NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
    supplier_id    SERIAL PRIMARY KEY,
    supplier_name  VARCHAR(255) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    phone_number   VARCHAR(20),
    email          VARCHAR(255),
    address        TEXT,
    ntn            VARCHAR(20),
    gst_number     VARCHAR(20),
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax Categories table
CREATE TABLE tax_categories (
    tax_category_id   SERIAL PRIMARY KEY,
    tax_category_name VARCHAR(100) UNIQUE NOT NULL,
    tax_rate          DECIMAL(5,2) NOT NULL,
    effective_date    DATE NOT NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    product_id      SERIAL PRIMARY KEY,
    product_code    VARCHAR(50) UNIQUE NOT NULL,
    product_name    VARCHAR(255) NOT NULL,
    description     TEXT,
    category_id     INTEGER REFERENCES categories(category_id),
    brand_id        INTEGER REFERENCES brands(brand_id),
    supplier_id     INTEGER REFERENCES suppliers(supplier_id),
    base_price      DECIMAL(10,2) NOT NULL,
    retail_price    DECIMAL(10,2) NOT NULL,
    tax_category_id INTEGER REFERENCES tax_categories(tax_category_id),
    is_active       BOOLEAN DEFAULT TRUE,
    barcode         VARCHAR(100) UNIQUE,
    unit_of_measure VARCHAR(50),
    weight          DECIMAL(10,3),
    reorder_level   INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Variants table
CREATE TABLE product_variants (
    variant_id    SERIAL PRIMARY KEY,
    product_id    INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    size          VARCHAR(50),
    color         VARCHAR(50),
    sku_suffix    VARCHAR(50),
    barcode       VARCHAR(100) UNIQUE,
    retail_price  DECIMAL(10,2),
    base_price    DECIMAL(10,2),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. STORE & USER MANAGEMENT
-- =============================================

-- Stores table
CREATE TABLE stores (
    store_id    SERIAL PRIMARY KEY,
    store_name  VARCHAR(255) UNIQUE NOT NULL,
    address     TEXT NOT NULL,
    phone_number VARCHAR(20),
    email       VARCHAR(255),
    city        VARCHAR(100),
    province    VARCHAR(100),
    postal_code VARCHAR(20),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POS Terminals table
CREATE TABLE pos_terminals (
    terminal_id   SERIAL PRIMARY KEY,
    store_id      INTEGER NOT NULL REFERENCES stores(store_id),
    terminal_name VARCHAR(100) NOT NULL,
    ip_address    VARCHAR(50),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, terminal_name)
);

-- Roles table
CREATE TABLE roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    permission_id   SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
    user_id      SERIAL PRIMARY KEY,
    username     VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    role_id      INTEGER NOT NULL REFERENCES roles(role_id),
    store_id     INTEGER REFERENCES stores(store_id),
    is_active    BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. INVENTORY MANAGEMENT
-- =============================================

-- Inventory table
CREATE TABLE inventory (
    inventory_id        SERIAL PRIMARY KEY,
    product_id          INTEGER NOT NULL REFERENCES products(product_id),
    variant_id          INTEGER REFERENCES product_variants(variant_id),
    store_id            INTEGER NOT NULL REFERENCES stores(store_id),
    current_stock       INTEGER NOT NULL DEFAULT 0,
    last_reorder_date   TIMESTAMP,
    last_stock_take_date TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, variant_id, store_id)
);

-- Enforce uniqueness for base products (no variant) per store in inventory
CREATE UNIQUE INDEX unique_inventory_no_variant
ON inventory (product_id, store_id)
WHERE variant_id IS NULL;

-- Inventory Movements table
CREATE TABLE inventory_movements (
    movement_id   SERIAL PRIMARY KEY,
    product_id    INTEGER NOT NULL REFERENCES products(product_id),
    variant_id    INTEGER REFERENCES product_variants(variant_id),
    store_id      INTEGER NOT NULL REFERENCES stores(store_id),
    movement_type VARCHAR(20) NOT NULL
        CHECK (movement_type IN ('SALE','RETURN','PURCHASE','ADJUSTMENT','TRANSFER_OUT','TRANSFER_IN','WASTE')),
    quantity      INTEGER NOT NULL,
    reference_id  INTEGER,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id       INTEGER NOT NULL REFERENCES users(user_id),
    notes         TEXT
);

-- =============================================
-- 4. CUSTOMER & LOYALTY MANAGEMENT
-- =============================================

-- Customers table
CREATE TABLE customers (
    customer_id        SERIAL PRIMARY KEY,
    first_name         VARCHAR(100) NOT NULL,
    last_name          VARCHAR(100) NOT NULL,
    phone_number       VARCHAR(20),
    email              VARCHAR(255),
    address            TEXT,
    city               VARCHAR(100),
    province           VARCHAR(100),
    postal_code        VARCHAR(20),
    loyalty_member_id  VARCHAR(50) UNIQUE,
    total_loyalty_points INTEGER DEFAULT 0,
    registration_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_purchase_date TIMESTAMP,
    is_active          BOOLEAN DEFAULT TRUE,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Points History table
CREATE TABLE loyalty_points_history (
    history_id   SERIAL PRIMARY KEY,
    customer_id  INTEGER NOT NULL REFERENCES customers(customer_id),
    sale_id      INTEGER, 
    points_change INTEGER NOT NULL,
    change_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description  TEXT
);

-- =============================================
-- 5. SALES & TRANSACTIONS
-- =============================================

-- Payment Methods table
CREATE TABLE payment_methods (
    payment_method_id SERIAL PRIMARY KEY,
    method_name       VARCHAR(100) UNIQUE NOT NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales Transactions table
CREATE TABLE sales_transactions (
    sale_id        SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    store_id       INTEGER NOT NULL REFERENCES stores(store_id),
    pos_terminal_id INTEGER NOT NULL REFERENCES pos_terminals(terminal_id),
    customer_id    INTEGER REFERENCES customers(customer_id),
    user_id        INTEGER NOT NULL REFERENCES users(user_id),
    sale_date      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sub_total      DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount     DECIMAL(10,2) DEFAULT 0,
    grand_total    DECIMAL(10,2) NOT NULL,
    amount_paid    DECIMAL(10,2) NOT NULL,
    change_given   DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'PAID'
        CHECK (payment_status IN ('PAID','PARTIAL','REFUNDED','VOID')),
    notes          TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale Items table
CREATE TABLE sale_items (
    sale_item_id   SERIAL PRIMARY KEY,
    sale_id        INTEGER NOT NULL REFERENCES sales_transactions(sale_id) ON DELETE CASCADE,
    product_id     INTEGER NOT NULL REFERENCES products(product_id),
    variant_id     INTEGER REFERENCES product_variants(variant_id),
    quantity       INTEGER NOT NULL,
    unit_price     DECIMAL(10,2) NOT NULL,
    discount_per_item DECIMAL(10,2) DEFAULT 0,
    tax_per_item   DECIMAL(10,2) DEFAULT 0,
    line_total     DECIMAL(10,2) NOT NULL,
    return_quantity INTEGER DEFAULT 0,
    batch_number   VARCHAR(100),
    expiry_date    DATE
);

-- Payments table
CREATE TABLE payments (
    payment_id            SERIAL PRIMARY KEY,
    sale_id               INTEGER NOT NULL REFERENCES sales_transactions(sale_id) ON DELETE CASCADE,
    payment_method_id     INTEGER NOT NULL REFERENCES payment_methods(payment_method_id),
    amount                DECIMAL(10,2) NOT NULL,
    transaction_reference VARCHAR(255),
    payment_date          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Returns table
CREATE TABLE returns (
    return_id          SERIAL PRIMARY KEY,
    sale_id            INTEGER NOT NULL REFERENCES sales_transactions(sale_id),
    return_date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_by_user_id INTEGER NOT NULL REFERENCES users(user_id),
    reason             TEXT,
    refund_amount      DECIMAL(10,2) NOT NULL,
    refund_method_id   INTEGER NOT NULL REFERENCES payment_methods(payment_method_id),
    notes              TEXT
);

-- Return Items table
CREATE TABLE return_items (
    return_item_id    SERIAL PRIMARY KEY,
    return_id         INTEGER NOT NULL REFERENCES returns(return_id) ON DELETE CASCADE,
    sale_item_id      INTEGER NOT NULL REFERENCES sale_items(sale_item_id),
    product_id        INTEGER NOT NULL REFERENCES products(product_id),
    variant_id        INTEGER REFERENCES product_variants(variant_id),
    quantity_returned INTEGER NOT NULL,
    refund_per_item   DECIMAL(10,2) NOT NULL
);

-- =============================================
-- 6. PURCHASE MANAGEMENT
-- =============================================

-- Purchase Orders table
CREATE TABLE purchase_orders (
    po_id                 SERIAL PRIMARY KEY,
    po_number             VARCHAR(100) UNIQUE NOT NULL,
    supplier_id           INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    store_id              INTEGER NOT NULL REFERENCES stores(store_id),
    order_date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date DATE,
    status                VARCHAR(20) DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','SENT','RECEIVED_PARTIAL','RECEIVED_FULL','CANCELLED')),
    total_amount          DECIMAL(10,2) NOT NULL,
    user_id               INTEGER NOT NULL REFERENCES users(user_id),
    notes                 TEXT,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items table
CREATE TABLE purchase_order_items (
    po_item_id       SERIAL PRIMARY KEY,
    po_id            INTEGER NOT NULL REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    product_id       INTEGER NOT NULL REFERENCES products(product_id),
    variant_id       INTEGER REFERENCES product_variants(variant_id),
    ordered_quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    unit_cost        DECIMAL(10,2) NOT NULL,
    line_total       DECIMAL(10,2) NOT NULL
);

-- Goods Receipt Notes table
CREATE TABLE goods_receipt_notes (
    grn_id               SERIAL PRIMARY KEY,
    grn_number           VARCHAR(100) UNIQUE NOT NULL,
    po_id                INTEGER REFERENCES purchase_orders(po_id),
    supplier_id          INTEGER NOT NULL REFERENCES suppliers(supplier_id),
    store_id             INTEGER NOT NULL REFERENCES stores(store_id),
    receipt_date         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id              INTEGER NOT NULL REFERENCES users(user_id),
    total_received_amount DECIMAL(10,2) NOT NULL,
    notes                TEXT
);

-- GRN Items table
CREATE TABLE grn_items (
    grn_item_id     SERIAL PRIMARY KEY,
    grn_id          INTEGER NOT NULL REFERENCES goods_receipt_notes(grn_id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(product_id),
    variant_id      INTEGER REFERENCES product_variants(variant_id),
    received_quantity INTEGER NOT NULL,
    unit_cost       DECIMAL(10,2) NOT NULL,
    batch_number    VARCHAR(100),
    expiry_date     DATE
);

-- =============================================
-- 7. ADVANCE ORDERS
-- =============================================

-- Advance Orders table
CREATE TABLE advance_orders (
    advance_order_id    SERIAL PRIMARY KEY,
    order_number        VARCHAR(100) UNIQUE NOT NULL,
    customer_id         INTEGER NOT NULL REFERENCES customers(customer_id),
    store_id            INTEGER NOT NULL REFERENCES stores(store_id),
    order_date          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_pickup_date TIMESTAMP,
    total_amount        DECIMAL(10,2) NOT NULL,
    advance_paid        DECIMAL(10,2) NOT NULL,
    balance_due         DECIMAL(10,2) NOT NULL,
    status              VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED','REFUNDED')),
    user_id             INTEGER NOT NULL REFERENCES users(user_id),
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advance Order Items table
CREATE TABLE advance_order_items (
    adv_order_item_id SERIAL PRIMARY KEY,
    advance_order_id  INTEGER NOT NULL REFERENCES advance_orders(advance_order_id) ON DELETE CASCADE,
    product_id        INTEGER NOT NULL REFERENCES products(product_id),
    variant_id        INTEGER REFERENCES product_variants(variant_id),
    quantity          INTEGER NOT NULL,
    unit_price        DECIMAL(10,2) NOT NULL,
    line_total        DECIMAL(10,2) NOT NULL
);

-- =============================================
-- 8. FINANCIAL & EXPENSE MANAGEMENT
-- =============================================

-- Expense Categories table
CREATE TABLE expense_categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    expense_id          SERIAL PRIMARY KEY,
    store_id            INTEGER NOT NULL REFERENCES stores(store_id),
    expense_category_id INTEGER NOT NULL REFERENCES expense_categories(category_id),
    amount              DECIMAL(10,2) NOT NULL,
    expense_date        DATE NOT NULL,
    description         TEXT NOT NULL,
    paid_by_user_id     INTEGER NOT NULL REFERENCES users(user_id),
    receipt_url         VARCHAR(500),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. SYSTEM CONFIGURATION & LOGGING
-- =============================================

-- Settings table
CREATE TABLE settings (
    setting_id   SERIAL PRIMARY KEY,
    setting_key  VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    store_id     INTEGER REFERENCES stores(store_id),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table
CREATE TABLE audit_logs (
    log_id       SERIAL PRIMARY KEY,
    user_id      INTEGER REFERENCES users(user_id),
    event_type   VARCHAR(100) NOT NULL,
    event_details TEXT,
    timestamp    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address   VARCHAR(50)
);

-- =============================================
-- FOREIGN KEYS
-- =============================================

ALTER TABLE loyalty_points_history 
  ADD CONSTRAINT fk_loyalty_points_sale_id 
  FOREIGN KEY (sale_id) REFERENCES sales_transactions(sale_id);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_products_code       ON products(product_code);
CREATE INDEX idx_products_barcode    ON products(barcode);
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_active     ON products(is_active);

CREATE INDEX idx_variants_product    ON product_variants(product_id);
CREATE INDEX idx_variants_barcode    ON product_variants(barcode);

CREATE INDEX idx_inventory_product_store ON inventory(product_id, store_id);
CREATE INDEX idx_inventory_store     ON inventory(store_id);

CREATE INDEX idx_sales_date          ON sales_transactions(sale_date);
CREATE INDEX idx_sales_invoice       ON sales_transactions(invoice_number);
CREATE INDEX idx_sales_store         ON sales_transactions(store_id);
CREATE INDEX idx_sales_customer      ON sales_transactions(customer_id);

CREATE INDEX idx_sale_items_sale     ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product  ON sale_items(product_id);

CREATE INDEX idx_movements_product   ON inventory_movements(product_id);
CREATE INDEX idx_movements_store     ON inventory_movements(store_id);
CREATE INDEX idx_movements_date      ON inventory_movements(movement_date);
CREATE INDEX idx_movements_type      ON inventory_movements(movement_type);

CREATE INDEX idx_customers_phone     ON customers(phone_number);
CREATE INDEX idx_customers_email     ON customers(email);
CREATE INDEX idx_customers_loyalty   ON customers(loyalty_member_id);

CREATE INDEX idx_po_number           ON purchase_orders(po_number);
CREATE INDEX idx_po_supplier         ON purchase_orders(supplier_id);
CREATE INDEX idx_po_store            ON purchase_orders(store_id);
CREATE INDEX idx_po_date             ON purchase_orders(order_date);

CREATE INDEX idx_users_username      ON users(username);
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_store         ON users(store_id);
CREATE INDEX idx_users_active        ON users(is_active);

-- =============================================
-- TRIGGERS TO MAINTAIN updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to each table with updated_at
DO $$
BEGIN
  FOR tbl IN 
    SELECT table_name 
      FROM information_schema.columns 
     WHERE column_name = 'updated_at' 
       AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER trig_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', tbl.table_name, tbl.table_name);
  END LOOP;
END;
$$;

-- =============================================
-- INITIAL DATA
-- =============================================

INSERT INTO tax_categories (tax_category_name, tax_rate, effective_date) VALUES
  ('Standard Sales Tax', 18.00, '2024-01-01'),
  ('Reduced Rate',       5.00, '2024-01-01'),
  ('Zero Rate',          0.00, '2024-01-01'),
  ('Exempt',             0.00, '2024-01-01');

INSERT INTO payment_methods (method_name) VALUES
  ('Cash'),
  ('Credit Card'),
  ('Debit Card'),
  ('Mobile Wallet'),
  ('Bank Transfer'),
  ('Cheque');

INSERT INTO roles (role_name, description) VALUES
  ('Administrator', 'Full system access'),
  ('Manager',       'Store management and reporting'),
  ('Cashier',       'Sales transactions and basic operations'),
  ('Stock Keeper',  'Inventory management'),
  ('Sales Associate','Customer service and sales support');

INSERT INTO permissions (permission_name, description) VALUES
  ('create_sale',          'Create sales transactions'),
  ('void_transaction',     'Void sales transactions'),
  ('process_return',       'Process customer returns'),
  ('manage_inventory',     'Manage product inventory'),
  ('view_reports',         'View system reports'),
  ('manage_products',      'Create and edit products'),
  ('manage_customers',     'Manage customer information'),
  ('manage_users',         'Manage system users'),
  ('manage_settings',      'Modify system settings'),
  ('manage_suppliers',     'Manage supplier information'),
  ('create_purchase_order','Create purchase orders'),
  ('receive_goods',        'Process goods receipt'),
  ('manage_expenses',      'Record and manage expenses'),
  ('view_financial_reports','View financial reports');

INSERT INTO expense_categories (category_name) VALUES
  ('Rent'),
  ('Utilities'),
  ('Salaries'),
  ('Maintenance'),
  ('Marketing'),
  ('Office Supplies'),
  ('Insurance'),
  ('Transportation'),
  ('Professional Services'),
  ('Other');

-- Complete
SELECT 'Candela POS Schema (no FBR) created successfully!' AS status; 