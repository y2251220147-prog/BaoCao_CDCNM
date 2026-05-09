const db = require('../config/db');

// ─── GET mood statistics ───────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? `AND DATE_FORMAT(t.date, '%Y-%m') = '${month}'` : '';

    // Overall mood distribution
    const [moodDist] = await db.query(`
      SELECT mood, COUNT(*) as count,
             SUM(amount) as total_amount,
             AVG(amount) as avg_amount
      FROM transactions
      WHERE mood IS NOT NULL AND status != 'cancelled' ${filter}
      GROUP BY mood
      ORDER BY count DESC
    `);

    // Spending by mood and category
    const [moodByCategory] = await db.query(`
      SELECT t.mood, c.name as category_name, c.color, c.icon,
             COUNT(*) as count, SUM(t.amount) as total_amount
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.mood IS NOT NULL AND t.type = 'expense' AND t.status != 'cancelled' ${filter}
      GROUP BY t.mood, t.category_id
      ORDER BY t.mood, total_amount DESC
    `);

    // Recent transactions with mood
    const [recentWithMood] = await db.query(`
      SELECT t.*, c.name as category_name, c.color, c.icon
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.mood IS NOT NULL AND t.status != 'cancelled' ${filter}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT 20
    `);

    // Mood trend (last 7 days)
    const [moodTrend] = await db.query(`
      SELECT DATE(t.date) as date, t.mood, COUNT(*) as count, SUM(t.amount) as total
      FROM transactions t
      WHERE t.mood IS NOT NULL AND t.date >= CURDATE() - INTERVAL 30 DAY ${filter.replace('AND DATE_FORMAT(t.date, \'%Y-%m\') = \'${month}\'', '')}
      GROUP BY DATE(t.date), t.mood
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        distribution: moodDist,
        by_category: moodByCategory,
        recent: recentWithMood,
        trend: moodTrend,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
