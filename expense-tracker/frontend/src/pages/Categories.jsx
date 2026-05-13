import { useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Plus, Trash2, Briefcase, Code, TrendingUp, Utensils, Car, Home, Smile, Heart, Book, ShoppingBag, MoreHorizontal, Tag } from 'lucide-react';

const IconMap = {
  'briefcase': Briefcase,
  'code': Code,
  'trending-up': TrendingUp,
  'utensils': Utensils,
  'car': Car,
  'home': Home,
  'smile': Smile,
  'heart': Heart,
  'book': Book,
  'shopping-bag': ShoppingBag,
  'more-horizontal': MoreHorizontal,
  'tag': Tag
};

const CategoryIcon = ({ name, color, size = 20 }) => {
  const Icon = IconMap[name] || Tag;
  return <Icon size={size} color={color} />;
};

const EMPTY = { name: '', icon: 'tag', color: '#6366f1', type: 'expense' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toast, setToast] = useState(null);

  const load = () => getCategories().then(r => setCategories(r.data.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(form);
      setShowModal(false);
      setForm(EMPTY);
      load();
      setToast({ message: 'Đã thêm danh mục!', type: 'success' });
    } catch {
      setToast({ message: 'Thêm danh mục thất bại', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa danh mục này? Không thể xóa nếu đã có giao dịch liên kết.')) return;
    try {
      await deleteCategory(id);
      load();
      setToast({ message: 'Đã xóa!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Xóa thất bại', type: 'error' });
    }
  };

  const income = categories.filter(c => c.type === 'income');
  const expense = categories.filter(c => c.type === 'expense');

  const renderGroup = (title, list) => (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 16 }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {list.map(c => (
          <div key={c.id} className="card card-sm" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderLeft: `3px solid ${c.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CategoryIcon name={c.icon} color={c.color} size={18} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</span>
            </div>
            <button className="btn btn-danger btn-sm" style={{ padding: '5px', minWidth: 'unset' }}
              onClick={() => handleDelete(c.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Danh mục</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="btn-add-category">
          <Plus size={16} /> Thêm Danh mục
        </button>
      </div>

      <div className="card">
        {renderGroup('Danh mục Thu nhập', income)}
        {renderGroup('Danh mục Chi phí', expense)}
      </div>

      {showModal && (
        <Modal title="Thêm Danh mục" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Tên</label>
                <input type="text" className="form-input" required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Loại</label>
                <select className="form-select"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="income">Thu nhập</option>
                  <option value="expense">Chi phí</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Màu sắc</label>
                <input type="color" style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', cursor: 'pointer' }}
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">Thêm</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="toast-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
