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
  ('LÆ°Æ¡ng',         'briefcase', '#10b981', 'income'),
  ('LÃ m thÃªm',      'code',      '#06b6d4', 'income'),
  ('Äáº§u tÆ°',        'trending-up','#8b5cf6','income'),
  ('Ä‚n uá»‘ng',       'utensils',  '#f59e0b', 'expense'),
  ('Di chuyá»ƒn',     'car',       '#3b82f6', 'expense'),
  ('NhÃ  cá»­a',       'home',      '#6366f1', 'expense'),
  ('Giáº£i trÃ­',      'smile',     '#ec4899', 'expense'),
  ('Sá»©c khá»e',      'heart',     '#ef4444', 'expense'),
  ('Há»c táº­p',       'book',      '#14b8a6', 'expense'),
  ('Mua sáº¯m',       'shopping-bag','#f97316','expense'),
  ('KhÃ¡c',          'more-horizontal','#6b7280','expense');

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
  (5000000,  'income',  1, 'LÆ°Æ¡ng thÃ¡ng 4',                       CURDATE() - INTERVAL 2 DAY,  'completed'),
  (1500000,  'income',  2, 'LÃ m website cho khÃ¡ch hÃ ng A',        CURDATE() - INTERVAL 5 DAY,  'completed'),
  (350000,   'expense', 4, 'Ä‚n trÆ°a & cÃ  phÃª vá»›i nhÃ³m',           CURDATE() - INTERVAL 1 DAY,  'completed'),
  (120000,   'expense', 5, 'Äi Grab Ä‘áº¿n cÃ´ng ty',                 CURDATE(),                   'completed'),
  (2500000,  'expense', 6, 'Tiá»n thuÃª nhÃ  thÃ¡ng 4',               CURDATE() - INTERVAL 3 DAY,  'completed'),
  (200000,   'expense', 7, 'Gia háº¡n Netflix + Spotify',           CURDATE() - INTERVAL 7 DAY,  'completed'),
  (450000,   'expense', 8, 'Mua thuá»‘c & vitamin',                 CURDATE() - INTERVAL 10 DAY, 'completed'),
  (800000,   'expense', 9, 'KhÃ³a há»c online - React',             CURDATE() - INTERVAL 15 DAY, 'completed'),
  (650000,   'expense', 10,'Mua giÃ y má»›i',                        CURDATE() - INTERVAL 4 DAY,  'completed'),
  (300000,   'income',  3, 'Cá»• tá»©c tá»« cá»• phiáº¿u',                  CURDATE() - INTERVAL 20 DAY, 'completed'),
  (180000,   'expense', 4, 'Ä‚n tá»‘i cÃ¹ng gia Ä‘Ã¬nh',                CURDATE() - INTERVAL 6 DAY,  'pending'),
  (95000,    'expense', 5, 'VÃ© xe buÃ½t tuáº§n',                     CURDATE() - INTERVAL 8 DAY,  'completed');

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
-- =============================================
-- Expense Tracker Schema v2 â€“ Extension
-- Run after schema.sql (MySQL 8.0+ / 9.0+)
-- =============================================
USE expense_tracker;

-- ---------------------------------------------
-- Add mood column to transactions (safe drop+add)
-- ---------------------------------------------
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'expense_tracker'
    AND TABLE_NAME   = 'transactions'
    AND COLUMN_NAME  = 'mood'
);

SET @sql = IF(@col_exists = 0,
  "ALTER TABLE transactions ADD COLUMN mood ENUM('happy','sad','angry','tired','neutral') DEFAULT NULL",
  "SELECT 'mood column already exists' AS info"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------
-- Table: challenges
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS challenges (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(200)  NOT NULL,
  description    TEXT,
  target_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
  saved_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  start_date     DATE          NOT NULL,
  end_date       DATE          NOT NULL,
  status         ENUM('active','completed','failed') NOT NULL DEFAULT 'active',
  badge          VARCHAR(100)  DEFAULT NULL,
  reward         VARCHAR(200)  DEFAULT NULL,
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed sample challenges (only if table is empty)
INSERT INTO challenges (title, description, target_amount, saved_amount, start_date, end_date, status, badge, reward)
SELECT * FROM (
  SELECT
    '7 ngÃ y khÃ´ng trÃ  sá»¯a ðŸ§‹'          AS title,
    'Nhá»‹n trÃ  sá»¯a 1 tuáº§n Ä‘á»ƒ tiáº¿t kiá»‡m tiá»n' AS description,
    350000   AS target_amount,
    150000   AS saved_amount,
    CURDATE() - INTERVAL 3 DAY          AS start_date,
    CURDATE() + INTERVAL 4 DAY          AS end_date,
    'active'                             AS status,
    'ðŸ… NgÆ°á»i kiÃªn Ä‘á»‹nh'                AS badge,
    'Tá»± thÆ°á»Ÿng 1 bá»¯a Äƒn ngon'          AS reward
  UNION ALL SELECT
    'Tiáº¿t kiá»‡m 1 triá»‡u thÃ¡ng nÃ y ðŸ’°',
    'Äá»ƒ dÃ nh 1 triá»‡u vÃ o cuá»‘i thÃ¡ng',
    1000000, 600000,
    DATE_FORMAT(CURDATE(), '%Y-%m-01'),
    LAST_DAY(CURDATE()),
    'active',
    'ðŸ¥‡ ChuyÃªn gia tiáº¿t kiá»‡m',
    'Mua 1 mÃ³n Ä‘á»“ yÃªu thÃ­ch'
  UNION ALL SELECT
    'KhÃ´ng mua sáº¯m online 2 tuáº§n ðŸ›ï¸',
    'TrÃ¡nh xa Shopee, Lazada trong 14 ngÃ y',
    500000, 500000,
    CURDATE() - INTERVAL 14 DAY,
    CURDATE(),
    'completed',
    'ðŸ† Chiáº¿n tháº¯ng cÃ¡m dá»—',
    'Xem phim cÃ¹ng báº¡n bÃ¨'
) AS tmp
WHERE (SELECT COUNT(*) FROM challenges) = 0;
