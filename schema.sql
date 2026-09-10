-- PostgreSQL Database Schema for Supriszo & Co. Gifting Storefront

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(255),
  category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
  tag VARCHAR(50) DEFAULT 'Curated',
  price INT NOT NULL,
  mrp INT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  rating NUMERIC(3,1) DEFAULT 4.8,
  reviews INT DEFAULT 100,
  stock_quantity INT DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL DEFAULT 'default_guest',
  product_id VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  personalisation_json JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_session_product UNIQUE(session_id, product_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL DEFAULT 'default_guest',
  product_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_session_fav_product UNIQUE(session_id, product_id)
);

CREATE TABLE IF NOT EXISTS personalisations (
  session_id VARCHAR(100) PRIMARY KEY DEFAULT 'default_guest',
  message TEXT,
  ribbon VARCHAR(100),
  occasion VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'confirmed',
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  items_json JSONB NOT NULL,
  total INT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_requests (
  id VARCHAR(100) PRIMARY KEY,
  req_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_contact VARCHAR(255) NOT NULL,
  occasion VARCHAR(100),
  budget VARCHAR(100),
  details TEXT,
  ribbon VARCHAR(100),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  admin_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

