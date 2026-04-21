const db = require('../config/db');

exports.getAll = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY type, name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, icon, color, type } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, message: 'Vui lòng nhập tên và loại' });
    const [result] = await db.query(
      'INSERT INTO categories (name, icon, color, type) VALUES (?, ?, ?, ?)',
      [name, icon || 'tag', color || '#6366f1', type]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const [result] = await db.query(
      'UPDATE categories SET name=?, icon=?, color=? WHERE id=?',
      [name, icon, color, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM categories WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    res.json({ success: true, message: 'Đã xóa' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
