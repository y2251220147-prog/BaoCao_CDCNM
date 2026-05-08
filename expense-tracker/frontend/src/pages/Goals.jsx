import { useEffect, useState } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Plus, Target, Trash2, Pencil, Calendar } from 'lucide-react';

const EMPTY_GOAL = { name: '', target_amount: '', current_amount: 0, deadline: '', color: '#6366f1' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_GOAL);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    getGoals().then(res => setGoals(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_GOAL); setShowModal(true); };
  const openEdit = (g) => {
    setEditing(g.id);
    setForm({
      name: g.name, target_amount: g.target_amount, 
      current_amount: g.current_amount, deadline: g.deadline?.slice(0,10), color: g.color
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateGoal(editing, form);
      else await createGoal(form);
      setShowModal(false);
      load();
      setToast({ message: editing ? 'Đã cập nhật mục tiêu!' : 'Đã thêm mục tiêu mới!', type: 'success' });
    } catch {
      setToast({ message: 'Đã xảy ra lỗi', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa mục tiêu này?')) return;
    try {
      await deleteGoal(id);
      load();
      setToast({ message: 'Đã xóa!', type: 'success' });
    } catch {
      setToast({ message: 'Xóa thất bại', type: 'error' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mục tiêu Tiết kiệm</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Thêm Mục tiêu
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 32 }}>Đang tải…</p>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <Target size={48} strokeWidth={1} style={{ marginBottom: 16, color: 'var(--text-muted)' }} />
          <p>Bạn chưa có mục tiêu tiết kiệm nào. Hãy đặt ra mục tiêu đầu tiên!</p>
        </div>
      ) : (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {goals.map(goal => {
            const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
            return (
              <div key={goal.id} className="card goal-card" style={{ '--accent-color': goal.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: `${goal.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Target size={20} color={goal.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{goal.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {goal.deadline ? formatDate(goal.deadline) : 'Không có thời hạn'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(goal)}><Pencil size={14} /></button>
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(goal.id)}><Trash2 size={14} /></button>
                  </div>
                </div>

                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: goal.color }}>
                    {formatCurrency(goal.current_amount)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    mục tiêu: {formatCurrency(goal.target_amount)}
                  </span>
                </div>

                <div className="progress-bg" style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div className="progress-fill" style={{
                    height: '100%', width: `${progress}%`, background: goal.color, borderRadius: 4, transition: 'width 0.5s ease-out'
                  }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: goal.color }}>{progress.toFixed(1)}% Hoàn thành</span>
                  <span style={{ color: 'var(--text-muted)' }}>Còn lại: {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Sửa Mục tiêu' : 'Thêm Mục tiêu'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên mục tiêu</label>
              <input type="text" className="form-input" required placeholder="Ví dụ: Mua iPhone 16..."
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Số tiền mục tiêu</label>
                <input type="number" className="form-input" required min="1000"
                  value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Đã có sẵn</label>
                <input type="number" className="form-input" min="0"
                  value={form.current_amount} onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Thời hạn</label>
                <input type="date" className="form-input"
                  value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Màu sắc</label>
                <input type="color" className="form-input" style={{ height: 42, padding: 4 }}
                  value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Tạo mục tiêu'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
