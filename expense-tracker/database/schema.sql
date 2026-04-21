-- =============================================
-- Expense Tracker Database Schema
-- MySQL 8.0+
-- =============================================
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS expense_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE expense_tracker;

-- ---------------------------------------------
-- Table: categories
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  icon      VARCHAR(50)  NOT NULL DEFAULT 'tag',
  color     VARCHAR(20)  NOT NULL DEFAULT '#6366f1',
  type      ENUM('income','expense') NOT NULL DEFAULT 'expense',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed categories
INSERT INTO categories (name, icon, color, type) VALUES
  ('Lương',         'briefcase', '#10b981', 'income'),
  ('Làm thêm',      'code',      '#06b6d4', 'income'),
  ('Đầu tư',        'trending-up','#8b5cf6','income'),
  ('Ăn uống',       'utensils',  '#f59e0b', 'expense'),
  ('Di chuyển',     'car',       '#3b82f6', 'expense'),
  ('Nhà cửa',       'home',      '#6366f1', 'expense'),
  ('Giải trí',      'smile',     '#ec4899', 'expense'),
  ('Sức khỏe',      'heart',     '#ef4444', 'expense'),
  ('Học tập',       'book',      '#14b8a6', 'expense'),
  ('Mua sắm',       'shopping-bag','#f97316','expense'),
  ('Khác',          'more-horizontal','#6b7280','expense');

-- ---------------------------------------------
-- Table: transactions
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  amount      DECIMAL(15,2) NOT NULL,
  type        ENUM('income','expense') NOT NULL,
  category_id INT NOT NULL,
  description VARCHAR(255),
  date        DATE        NOT NULL,
  status      ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'completed',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Seed sample transactions (last 30 days)
INSERT INTO transactions (amount, type, category_id, description, date, status) VALUES
  (5000000,  'income',  1, 'Lương tháng 4',                       CURDATE() - INTERVAL 2 DAY,  'completed'),
  (1500000,  'income',  2, 'Làm website cho khách hàng A',        CURDATE() - INTERVAL 5 DAY,  'completed'),
  (350000,   'expense', 4, 'Ăn trưa & cà phê với nhóm',           CURDATE() - INTERVAL 1 DAY,  'completed'),
  (120000,   'expense', 5, 'Đi Grab đến công ty',                 CURDATE(),                   'completed'),
  (2500000,  'expense', 6, 'Tiền thuê nhà tháng 4',               CURDATE() - INTERVAL 3 DAY,  'completed'),
  (200000,   'expense', 7, 'Gia hạn Netflix + Spotify',           CURDATE() - INTERVAL 7 DAY,  'completed'),
  (450000,   'expense', 8, 'Mua thuốc & vitamin',                 CURDATE() - INTERVAL 10 DAY, 'completed'),
  (800000,   'expense', 9, 'Khóa học online - React',             CURDATE() - INTERVAL 15 DAY, 'completed'),
  (650000,   'expense', 10,'Mua giày mới',                        CURDATE() - INTERVAL 4 DAY,  'completed'),
  (300000,   'income',  3, 'Cổ tức từ cổ phiếu',                  CURDATE() - INTERVAL 20 DAY, 'completed'),
  (180000,   'expense', 4, 'Ăn tối cùng gia đình',                CURDATE() - INTERVAL 6 DAY,  'pending'),
  (95000,    'expense', 5, 'Vé xe buýt tuần',                     CURDATE() - INTERVAL 8 DAY,  'completed');

-- ---------------------------------------------
-- Table: budgets
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS budgets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  amount      DECIMAL(15,2) NOT NULL,
  month       DATE NOT NULL COMMENT 'First day of target month',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_budget (category_id, month),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed budgets for current month
INSERT INTO budgets (category_id, amount, month) VALUES
  (4,  1500000, DATE_FORMAT(CURDATE(), '%Y-%m-01')),  -- Food
  (5,   500000, DATE_FORMAT(CURDATE(), '%Y-%m-01')),  -- Transport
  (7,   300000, DATE_FORMAT(CURDATE(), '%Y-%m-01')),  -- Entertainment
  (10, 1000000, DATE_FORMAT(CURDATE(), '%Y-%m-01'));  -- Shopping
