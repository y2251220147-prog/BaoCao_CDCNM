// Script to update challenge titles with proper Vietnamese + emoji
// Run: node seed-challenges.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_tracker',
    charset: 'utf8mb4',
  });

  // Insert fresh data with correct Vietnamese + emoji
  const challenges = [
    ['7 ngày không trà sữa 🧋', 'Nhịn trà sữa 1 tuần để tiết kiệm tiền', 350000, 150000, '2026-05-05', '2026-05-12', 'active', '🏅 Người kiên định', 'Tự thưởng 1 bữa ăn ngon'],
    ['Tiết kiệm 1 triệu tháng này 💰', 'Để dành 1 triệu vào cuối tháng', 1000000, 600000, '2026-05-01', '2026-05-31', 'active', '🥇 Chuyên gia tiết kiệm', 'Mua 1 món đồ yêu thích'],
    ['Không mua sắm online 2 tuần 🛍️', 'Tránh xa Shopee, Lazada trong 14 ngày', 500000, 500000, '2026-04-24', '2026-05-08', 'completed', '🏆 Chiến thắng cám dỗ', 'Xem phim cùng bạn bè']
  ];

  for (const [title, desc, target, saved, start, end, status, badge, reward] of challenges) {
    await db.query(
      `INSERT INTO challenges (title, description, target_amount, saved_amount, start_date, end_date, status, badge, reward)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, desc, target, saved, start, end, status, badge, reward]
    );
  }

  console.log('✅ Challenge data seeded with correct Vietnamese + emoji');

  // Verify
  const [rows] = await db.query('SELECT id, title, badge FROM challenges');
  rows.forEach(r => console.log(r.id, r.title, '|', r.badge));

  await db.end();
}

run().catch(console.error);
