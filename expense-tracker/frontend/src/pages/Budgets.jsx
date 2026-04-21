import { useEffect, useState } from 'react';
import { getBudgets, getCategories, upsertBudget, deleteBudget } from '../services/api';
import { formatCurrency, currentMonth, clamp } from '../utils/helpers';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Plus, Trash2, Pencil } from 'lucide-react';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category_id: '', amount: '', month });
  const [toast, setToast] = useState(null);

  const load = () =>
    Promise.all([getBudgets({ month }), getCategories()])
      .then(([b, c]) => { setBudgets(b.data.data); setCategories(c.data.data); });

  useEffect(() => { load(); }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await upsertBudget({ ...form, month });
      setShowModal(false);
      setForm({ category_id: '', amount: '', month });
      load();
      setToast({ message: 'Đã lưu ngân sách!', type: 'success' });
    } catch {
      setToast({ message: 'Lưu ngân sách thất bại', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa ngân sách này?')) return;
    try {
      await deleteBudget(id);
      load();
      setToast({ message: 'Đã xóa!', type: 'success' });
    } catch {
      setToast({ message: 'Xóa thất bại', type: 'error' });
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const openAdd = () => { setForm({ category_id: '', amount: '', month }); setShowModal(true); };
  const openEdit = (b) => { setForm({ category_id: b.category_id, amount: b.amount, month }); setShowModal(true); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ngân sách</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="month" className="form-input" style={{ maxWidth: 180 }}
            value={month} onChange={e => setMonth(e.target.value)} />
          <button className="btn btn-primary" onClick={openAdd} id="btn-add-budget">
            <Plus size={16} /> Thiết lập Ngân sách
          </button>
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="card empty-state"><p>Chưa có ngân sách cho tháng này.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
          {budgets.map(b => {
            const pct = clamp((parseFloat(b.spent) / parseFloat(b.amount)) * 100);
            const over = pct >= 100;
            return (
              <div className="card" key={b.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{b.category_name}</div>
                    <div style={{ color: over ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.83rem' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '5px', minWidth: 'unset' }}
                      onClick={() => openEdit(b)} title="Sửa">
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ padding: '5px', minWidth: 'unset' }}
                      onClick={() => handleDelete(b.id)} title="Xóa">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--accent)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{pct.toFixed(0)}% đã dùng</span>
                  {over && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>⚠ Vượt ngân sách!</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Thiết lập Ngân sách" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Danh mục Chi phí</label>
                <select className="form-select" required
                  value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Chọn…</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền (VND)</label>
                <input type="number" className="form-input" min="1" required
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">Lưu</button>
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
