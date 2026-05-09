-- =============================================
-- Expense Tracker Schema v2 – Extension
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
    '7 ngày không trà sữa 🧋'          AS title,
    'Nhịn trà sữa 1 tuần để tiết kiệm tiền' AS description,
    350000   AS target_amount,
    150000   AS saved_amount,
    CURDATE() - INTERVAL 3 DAY          AS start_date,
    CURDATE() + INTERVAL 4 DAY          AS end_date,
    'active'                             AS status,
    '🏅 Người kiên định'                AS badge,
    'Tự thưởng 1 bữa ăn ngon'          AS reward
  UNION ALL SELECT
    'Tiết kiệm 1 triệu tháng này 💰',
    'Để dành 1 triệu vào cuối tháng',
    1000000, 600000,
    DATE_FORMAT(CURDATE(), '%Y-%m-01'),
    LAST_DAY(CURDATE()),
    'active',
    '🥇 Chuyên gia tiết kiệm',
    'Mua 1 món đồ yêu thích'
  UNION ALL SELECT
    'Không mua sắm online 2 tuần 🛍️',
    'Tránh xa Shopee, Lazada trong 14 ngày',
    500000, 500000,
    CURDATE() - INTERVAL 14 DAY,
    CURDATE(),
    'completed',
    '🏆 Chiến thắng cám dỗ',
    'Xem phim cùng bạn bè'
) AS tmp
WHERE (SELECT COUNT(*) FROM challenges) = 0;
