import { useEffect, useState, useCallback } from 'react';
import {
  getChallenges, createChallenge, updateChallenge,
  deleteChallenge, contributeChallenge,
} from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Plus, Trash2, Trophy, Target, TrendingUp, Pencil, Zap } from 'lucide-react';

const BADGES = ['🏅 Người kiên định', '🥇 Chuyên gia tiết kiệm', '🏆 Chiến thắng cám dỗ',
  '💎 Kim cương ý chí', '🌟 Ngôi sao tiết kiệm', '🎯 Bắn trúng mục tiêu'];

const EMPTY_FORM = {
  title: '', description: '', target_amount: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '', badge: BADGES[0], reward: '',
};

function ProgressBar({ value, max, color = 'var(--accent)' }) {
  const pct = Math.min(100, Math.round((value / max) * 100)) || 0;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {formatCurrency(value)} / {formatCurrency(max)}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg,#10b981,#059669)'
              : `linear-gradient(90deg,${color},${color}aa)`,
          }}
        />
      </div>
    </div>
  );
}

const STATUS_MAP = { active: 'Đang diễn ra', completed: 'Hoàn thành 🎉', failed: 'Thất bại' };
const STATUS_COLOR = { active: 'var(--accent)', completed: 'var(--success)', failed: 'var(--danger)' };

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [showContrib, setShowContrib] = useState(null); // challenge being contributed to
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [contribAmt, setContribAmt] = useState('');
  const [toast, setToast]           = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(() => {
    setLoading(true);
    getChallenges(filterStatus ? { status: filterStatus } : {})
      .then(r => setChallenges(r.data.data))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c.id);
    setForm({
      title: c.title, description: c.description || '',
      target_amount: c.target_amount, start_date: c.start_date?.slice(0, 10),
      end_date: c.end_date?.slice(0, 10), badge: c.badge || BADGES[0], reward: c.reward || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const ch = challenges.find(c => c.id === editing);
        await updateChallenge(editing, { ...form, saved_amount: ch.saved_amount, status: ch.status });
      } else {
        await createChallenge(form);
      }
      setShowModal(false);
      load();
      showToast(editing ? 'Đã cập nhật thử thách!' : 'Tạo thử thách mới thành công! 🚀');
    } catch {
      showToast('Đã xảy ra lỗi', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa thử thách này?')) return;
    try { await deleteChallenge(id); load(); showToast('Đã xóa!'); }
    catch { showToast('Xóa thất bại', 'error'); }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contribAmt || contribAmt <= 0) return;
    try {
      const r = await contributeChallenge(showContrib.id, { amount: parseFloat(contribAmt) });
      setShowContrib(null);
      setContribAmt('');
      load();
      if (r.data.data.completed) showToast('🎉 Chúc mừng! Bạn đã hoàn thành thử thách!');
      else showToast(`Đã cộng ${formatCurrency(contribAmt)}! Tiếp tục cố lên! 💪`);
    } catch { showToast('Lỗi rồi!', 'error'); }
  };

  const active    = challenges.filter(c => c.status === 'active');
  const completed = challenges.filter(c => c.status === 'completed');
  const totalSaved = challenges.reduce((s, c) => s + parseFloat(c.saved_amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Thử thách tiết kiệm 🏆</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Đặt mục tiêu, theo dõi tiến trình và nhận phần thưởng xứng đáng!
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="btn-add-challenge">
          <Plus size={16} /> Tạo thử thách
        </button>
      </div>

      {/* Stats overview */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 28 }}>
        <div className="stat-card" style={{ '--accent-color': '#4f46e5' }}>
          <div className="label">ĐANG THỰC HIỆN</div>
          <div className="amount" style={{ color: 'var(--accent)' }}>{active.length}</div>
          <div className="delta">thử thách</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': '#10b981' }}>
          <div className="label">ĐÃ HOÀN THÀNH</div>
          <div className="amount" style={{ color: 'var(--success)' }}>{completed.length}</div>
          <div className="delta">thử thách</div>
        </div>
        <div className="stat-card" style={{ '--accent-color': '#ec4899' }}>
          <div className="label">TỔNG ĐÃ TIẾT KIỆM</div>
          <div className="amount" style={{ color: '#ec4899', fontSize: '1.4rem' }}>
            {formatCurrency(totalSaved)}
          </div>
          <div className="delta">từ tất cả thử thách</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'active', 'completed', 'failed'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === '' ? 'Tất cả' : s === 'active' ? '⚡ Đang diễn ra' : s === 'completed' ? '✅ Hoàn thành' : '❌ Thất bại'}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: 32 }}>Đang tải…</p>
      ) : challenges.length === 0 ? (
        <div className="empty-state card">
          <Trophy size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
          <p>Chưa có thử thách nào. Hãy tạo thử thách đầu tiên!</p>
        </div>
      ) : (
        <div className="challenge-grid">
          {challenges.map(ch => {
            const pct = Math.min(100, Math.round((ch.saved_amount / ch.target_amount) * 100)) || 0;
            const color = STATUS_COLOR[ch.status];
            return (
              <div key={ch.id} className={`challenge-card card ${ch.status}`}>
                {/* Status badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className="challenge-status-badge" style={{ color, background: `${color}18` }}>
                    {STATUS_MAP[ch.status]}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {ch.status === 'active' && (
                      <button className="btn btn-sm btn-ghost"
                        onClick={() => { setShowContrib(ch); setContribAmt(''); }}
                        title="Nạp tiền tiết kiệm">
                        <Zap size={13} /> Nạp
                      </button>
                    )}
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(ch)} title="Sửa">
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ch.id)} title="Xóa">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{ch.title}</h3>
                {ch.description && (
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    {ch.description}
                  </p>
                )}

                <ProgressBar value={ch.saved_amount} max={ch.target_amount} color={color} />

                <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span><Target size={12} style={{ marginRight: 4 }} />{formatDate(ch.start_date)} → {formatDate(ch.end_date)}</span>
                </div>

                {/* Badge & reward */}
                {(ch.badge || ch.reward) && (
                  <div className="challenge-reward-box">
                    {ch.badge && <span className="challenge-badge-pill">{ch.badge}</span>}
                    {ch.reward && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        🎁 <em>{ch.reward}</em>
                      </div>
                    )}
                  </div>
                )}

                {ch.status === 'completed' && (
                  <div className="challenge-completed-overlay">
                    <Trophy size={20} />
                    <span>Xuất sắc! Bạn đã hoàn thành!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <Modal title={editing ? 'Sửa thử thách' : '🏆 Tạo thử thách mới'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-form-grid">
              <div className="form-group full">
                <label className="form-label">Tên thử thách *</label>
                <input type="text" className="form-input" required placeholder="VD: 7 ngày không trà sữa 🧋"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label className="form-label">Mô tả</label>
                <input type="text" className="form-input" placeholder="Mục đích của thử thách…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Mục tiêu (VND) *</label>
                <input type="number" className="form-input" required min="1"
                  value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Badge phần thưởng</label>
                <select className="form-select" value={form.badge}
                  onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}>
                  {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ngày bắt đầu *</label>
                <input type="date" className="form-input" required
                  value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày kết thúc *</label>
                <input type="date" className="form-input" required
                  value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label className="form-label">🎁 Phần thưởng khi hoàn thành</label>
                <input type="text" className="form-input" placeholder="VD: Tự thưởng 1 bữa ăn ngon"
                  value={form.reward} onChange={e => setForm(f => ({ ...f, reward: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Cập nhật' : 'Tạo thử thách 🚀'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Contribute modal */}
      {showContrib && (
        <Modal title={`💪 Nạp tiền: ${showContrib.title}`} onClose={() => setShowContrib(null)}>
          <div style={{ marginBottom: 16 }}>
            <ProgressBar value={showContrib.saved_amount} max={showContrib.target_amount} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12 }}>
              Còn phải tiết kiệm thêm: <strong style={{ color: 'var(--accent)' }}>
                {formatCurrency(showContrib.target_amount - showContrib.saved_amount)}
              </strong>
            </p>
          </div>
          <form onSubmit={handleContribute}>
            <div className="form-group">
              <label className="form-label">Số tiền muốn nạp (VND)</label>
              <input type="number" className="form-input" required min="1" autoFocus
                value={contribAmt} onChange={e => setContribAmt(e.target.value)}
                placeholder="Nhập số tiền..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowContrib(null)}>Hủy</button>
              <button type="submit" className="btn btn-primary"><TrendingUp size={15} /> Nạp tiền</button>
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
