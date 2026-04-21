const db = require('../config/db');

// ─── GET all transactions (with filters) ──────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { type, category_id, month, status } = req.query;
    let sql = `
      SELECT t.*, c.name AS category_name, c.icon, c.color
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE 1=1
    `;
    const params = [];

    if (type)        { sql += ' AND t.type = ?';        params.push(type); }
    if (category_id) { sql += ' AND t.category_id = ?'; params.push(category_id); }
    if (status)      { sql += ' AND t.status = ?';      params.push(status); }
    if (month)       { sql += ' AND DATE_FORMAT(t.date, "%Y-%m") = ?'; params.push(month); }

    sql += ' ORDER BY t.date DESC, t.created_at DESC';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET single transaction ───────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, c.name AS category_name, c.icon, c.color
       FROM transactions t JOIN categories c ON c.id = t.category_id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE transaction ───────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { amount, type, category_id, description, date, status } = req.body;
    if (!amount || !type || !category_id || !date)
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ: số tiền, loại, danh mục và ngày' });

    const [result] = await db.query(
      `INSERT INTO transactions (amount, type, category_id, description, date, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [amount, type, category_id, description || '', date, status || 'completed']
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE transaction ───────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { amount, type, category_id, description, date, status } = req.body;
    const [result] = await db.query(
      `UPDATE transactions
       SET amount=?, type=?, category_id=?, description=?, date=?, status=?
       WHERE id=?`,
      [amount, type, category_id, description, date, status, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE transaction ───────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET dashboard summary ────────────────────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query; // format: YYYY-MM
    const filter = month ? `AND DATE_FORMAT(date, '%Y-%m') = '${month}'` : '';

    const [rows] = await db.query(`
      SELECT
        SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
        COUNT(*) AS transaction_count
      FROM transactions
      WHERE status != 'cancelled' ${filter}
    `);

    const [byCategory] = await db.query(`
      SELECT c.name, c.color, c.icon, t.type,
             SUM(t.amount) AS total
      FROM transactions t JOIN categories c ON c.id = t.category_id
      WHERE t.status != 'cancelled' ${filter}
      GROUP BY c.id, t.type
      ORDER BY total DESC
    `);

    res.json({ success: true, data: { ...rows[0], by_category: byCategory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
