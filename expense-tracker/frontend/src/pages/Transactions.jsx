import { useEffect, useState, useCallback } from 'react';
import { getTransactions, getCategories, createTransaction, updateTransaction, deleteTransaction } from '../services/api';
import { formatCurrency, formatDate, StatusMap, exportToCSV } from '../utils/helpers';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Plus, Pencil, Trash2, Filter, Search, Download } from 'lucide-react';

const EMPTY_FORM = {
  amount: '', type: 'expense', category_id: '',
  description: '', date: new Date().toISOString().slice(0, 10), status: 'completed',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState({ type: '', month: '', q: '' });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getTransactions(filter),
      getCategories(),
    ]).then(([t, c]) => {
      setTransactions(t.data.data);
      setCategories(c.data.data);
    }).finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (tx) => {
    setEditing(tx.id);
    setForm({
      amount: tx.amount, type: tx.type, category_id: tx.category_id,
      description: tx.description, date: tx.date?.slice(0, 10), status: tx.status
    });
    setShowModal(true);
  };

  const handleExport = () => {
    const dataToExport = transactions.map(t => ({
      'ID': t.id,
      'Mô tả': t.description,
      'Số tiền': t.amount,
      'Loại': t.type === 'income' ? 'Thu nhập' : 'Chi phí',
      'Danh mục': t.category_name,
      'Ngày': formatDate(t.date),
      'Trạng thái': StatusMap[t.status]
    }));
    exportToCSV(dataToExport, `Giao-dich-${new Date().toISOString().slice(0, 10)}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateTransaction(editing, form);
      else await createTransaction(form);
      setShowModal(false);
      load();
      setToast({ message: editing ? 'Đã cập nhật!' : 'Đã thêm!', type: 'success' });
    } catch {
      setToast({ message: 'Đã xảy ra lỗi', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa giao dịch này?')) return;
    try {
      await deleteTransaction(id);
      load();
      setToast({ message: 'Đã xóa!', type: 'success' });
    } catch {
      setToast({ message: 'Xóa thất bại', type: 'error' });
    }
  };

  const filteredCats = categories.filter(c => !form.type || c.type === form.type);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Giao dịch</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={handleExport} title="Xuất CSV">
            <Download size={16} /> Xuất CSV
          </button>
          <button className="btn btn-primary" onClick={openAdd} id="btn-add-transaction">
            <Plus size={16} /> Thêm Giao dịch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-sm" style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select className="form-select" style={{ maxWidth: 160 }}
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}>
          <option value="">Tất cả</option>
          <option value="income">Thu nhập</option>
          <option value="expense">Chi phí</option>
        </select>
        <input type="month" className="form-input" style={{ maxWidth: 160 }}
          value={filter.month}
          onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}
        />
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
          <input type="text" className="form-input" placeholder="Tìm mô tả..."
            style={{ paddingLeft: 32 }}
            value={filter.q}
            onChange={e => setFilter(f => ({ ...f, q: e.target.value }))}
          />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setFilter({ type: '', month: '', q: '' })}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--text-muted)', padding: 32 }}>Đang tải…</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state"><p>Không tìm thấy giao dịch nào.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Mô tả</th><th>Danh mục</th>
                  <th>Ngày</th><th>Trạng thái</th><th>Số tiền</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>{tx.description || '—'}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 8,
                        background: `${tx.color}22`, color: tx.color, fontSize: '0.82rem', fontWeight: 600,
                      }}>
                        {tx.category_name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDate(tx.date)}</td>
                    <td><span className={`badge badge-${tx.status}`}>{StatusMap[tx.status]}</span></td>
                    <td className={`amount-${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(tx)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tx.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Sửa Giao dịch' : 'Thêm Giao dịch'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="modal-form-grid">
              <div className="form-group">
                <label className="form-label">Loại</label>
                <select className="form-select" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value, category_id: '' }))}>
                  <option value="income">Thu nhập</option>
                  <option value="expense">Chi phí</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền (VND)</label>
                <input type="number" className="form-input" min="1" required
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" required value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">Chọn danh mục</option>
                  {filteredCats.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <select className="form-select" value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="completed">Hoàn thành</option>
                  <option value="pending">Đang chờ</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Description</label>
                <input type="text" className="form-input" placeholder="Tùy chọn…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast */}
      <div className="toast-container">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
