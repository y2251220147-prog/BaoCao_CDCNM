const db = require('../config/db');

// ─── GET all challenges ────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM challenges';
    const params = [];
    if (status) { sql += ' WHERE status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET single challenge ─────────────────────────────────────────────────────
exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM challenges WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy thử thách' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE challenge ─────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { title, description, target_amount, start_date, end_date, badge, reward } = req.body;
    if (!title || !target_amount || !start_date || !end_date)
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });

    const [result] = await db.query(
      `INSERT INTO challenges (title, description, target_amount, saved_amount, start_date, end_date, status, badge, reward)
       VALUES (?, ?, ?, 0, ?, ?, 'active', ?, ?)`,
      [title, description || '', target_amount, start_date, end_date, badge || null, reward || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE challenge ─────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { title, description, target_amount, saved_amount, start_date, end_date, status, badge, reward } = req.body;
    const [result] = await db.query(
      `UPDATE challenges
       SET title=?, description=?, target_amount=?, saved_amount=?, start_date=?, end_date=?, status=?, badge=?, reward=?
       WHERE id=?`,
      [title, description, target_amount, saved_amount, start_date, end_date, status, badge, reward, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy thử thách' });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE saved amount (contribute) ────────────────────────────────────────
exports.contribute = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });

    const [rows] = await db.query('SELECT * FROM challenges WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Không tìm thấy thử thách' });

    const challenge = rows[0];
    const newSaved = Math.min(parseFloat(challenge.saved_amount) + parseFloat(amount), parseFloat(challenge.target_amount));
    const newStatus = newSaved >= challenge.target_amount ? 'completed' : challenge.status;

    await db.query(
      'UPDATE challenges SET saved_amount = ?, status = ? WHERE id = ?',
      [newSaved, newStatus, req.params.id]
    );

    res.json({ success: true, data: { saved_amount: newSaved, status: newStatus, completed: newStatus === 'completed' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE challenge ─────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM challenges WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy thử thách' });
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
