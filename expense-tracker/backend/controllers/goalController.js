const db = require('../config/db');

// GET all goals
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM goals ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE goal
exports.create = async (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline, color } = req.body;
    if (!name || !target_amount) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và số tiền mục tiêu' });
    }

    const [result] = await db.query(
      'INSERT INTO goals (name, target_amount, current_amount, deadline, color) VALUES (?, ?, ?, ?, ?)',
      [name, target_amount, current_amount || 0, deadline || null, color || '#6366f1']
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE goal
exports.update = async (req, res) => {
  try {
    const { name, target_amount, current_amount, deadline, color } = req.body;
    const [result] = await db.query(
      'UPDATE goals SET name=?, target_amount=?, current_amount=?, deadline=?, color=? WHERE id=?',
      [name, target_amount, current_amount, deadline, color, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu' });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE goal
exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM goals WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy mục tiêu' });
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
