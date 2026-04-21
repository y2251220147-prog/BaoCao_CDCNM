const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { month } = req.query;
    let sql = `
      SELECT b.*, c.name AS category_name, c.icon, c.color,
             COALESCE(
               (SELECT SUM(t.amount) FROM transactions t
                WHERE t.category_id = b.category_id
                  AND t.type = 'expense'
                  AND t.status != 'cancelled'
                  AND DATE_FORMAT(t.date, '%Y-%m') = DATE_FORMAT(b.month, '%Y-%m')),
             0) AS spent
      FROM budgets b JOIN categories c ON c.id = b.category_id
    `;
    const params = [];
    if (month) { sql += ' WHERE DATE_FORMAT(b.month, "%Y-%m") = ?'; params.push(month); }
    sql += ' ORDER BY c.name';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { category_id, amount, month } = req.body;
    if (!category_id || !amount || !month)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ: danh mục, số tiền và tháng' });

    await db.query(
      `INSERT INTO budgets (category_id, amount, month) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [category_id, amount, month + '-01']
    );
    res.json({ success: true, message: 'Đã lưu ngân sách' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM budgets WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy ngân sách' });
    res.json({ success: true, message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
