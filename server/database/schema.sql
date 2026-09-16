CREATE DATABASE IF NOT EXISTS veylix_db;

USE veylix_db;


-- =========================================
-- USERS
-- Admin, Manager, Employee accounts
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================
-- CUSTOMERS
-- =========================================

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(150),
    address VARCHAR(255),
    city VARCHAR(100),
    area VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================
-- CATEGORIES
-- =========================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- PRODUCTS
-- =========================================

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    category_id INT,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    image VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================================
-- ORDERS
-- Customer website orders + physical shop sales
-- =========================================

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    customer_id INT NULL,

    customer_name VARCHAR(100),
    customer_phone VARCHAR(30),
    customer_email VARCHAR(150),

    delivery_address VARCHAR(255),
    city VARCHAR(100),
    area VARCHAR(100),
    postal_code VARCHAR(20),

    order_type ENUM('online', 'pos') NOT NULL DEFAULT 'online',

    payment_method ENUM(
        'cod',
        'bkash',
        'nagad',
        'card',
        'cash'
    ) NOT NULL DEFAULT 'cod',

    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',

    order_status ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'completed'
    ) NOT NULL DEFAULT 'pending',

    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    notes TEXT,

    created_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_orders_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================================
-- ORDER ITEMS
-- =========================================

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,
    product_id INT NULL,

    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(100),

    quantity INT NOT NULL DEFAULT 1,

    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================================
-- PAYMENTS
-- =========================================

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    payment_method ENUM(
        'cod',
        'bkash',
        'nagad',
        'card',
        'cash'
    ) NOT NULL,

    transaction_id VARCHAR(150),

    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    payment_status ENUM(
        'pending',
        'paid',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',

    paid_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================
-- INVENTORY TRANSACTIONS
-- Tracks stock increase/decrease
-- =========================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    transaction_type ENUM(
        'purchase',
        'sale',
        'return',
        'adjustment'
    ) NOT NULL,

    quantity INT NOT NULL,

    reference_type VARCHAR(50),
    reference_id INT,

    note VARCHAR(255),

    created_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_inventory_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================================
-- PRODUCT STOCK HISTORY
-- =========================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    previous_stock INT NOT NULL DEFAULT 0,
    quantity_changed INT NOT NULL DEFAULT 0,
    new_stock INT NOT NULL DEFAULT 0,

    reason VARCHAR(100),

    reference_id INT NULL,

    created_by INT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_stock_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);


-- =========================================
-- STORE SETTINGS
-- =========================================

CREATE TABLE IF NOT EXISTS store_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    store_name VARCHAR(150) NOT NULL DEFAULT 'Veylix',
    phone VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(255),

    invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'VXL',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================
-- DEFAULT CATEGORIES
-- =========================================

INSERT IGNORE INTO categories (name, slug, description)
VALUES
    ('Accessories', 'accessories', 'Fashion and lifestyle accessories'),
    ('Footwear', 'footwear', 'Shoes and other footwear'),
    ('Bags', 'bags', 'Backpacks, handbags and other bags'),
    ('Electronics', 'electronics', 'Electronic products and gadgets');


-- =========================================
-- DEFAULT STORE INFORMATION
-- =========================================

INSERT INTO store_settings (
    store_name,
    phone,
    email,
    address,
    invoice_prefix
)
SELECT
    'Veylix',
    '',
    '',
    '',
    'VXL'
WHERE NOT EXISTS (
    SELECT 1
    FROM store_settings
);


-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_products_name
ON products(name);

CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_status
ON orders(order_status);

CREATE INDEX idx_orders_created_at
ON orders(created_at);

CREATE INDEX idx_order_items_order
ON order_items(order_id);

CREATE INDEX idx_payments_order
ON payments(order_id);

CREATE INDEX idx_inventory_product
ON inventory_transactions(product_id);

CREATE INDEX idx_stock_product
ON stock_movements(product_id);