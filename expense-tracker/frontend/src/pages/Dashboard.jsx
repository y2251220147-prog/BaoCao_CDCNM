import { useEffect, useState } from 'react';
import { getSummary, getTransactions, getBudgets } from '../services/api';
import { formatCurrency, formatDate, currentMonth, StatusMap } from '../utils/helpers';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];

export default function Dashboard() {
  const [summary, setSummary]   = useState(null);
  const [recent, setRecent]     = useState([]);
  const [budgets, setBudgets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [month, setMonth]       = useState(currentMonth());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSummary({ month }),
      getTransactions({ month }),
      getBudgets({ month }),
    ]).then(([s, t, b]) => {
      setSummary(s.data.data);
      setRecent(t.data.data.slice(0, 8));
      setBudgets(b.data.data);
    }).finally(() => setLoading(false));
  }, [month]);

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Đang tải…</div>;

  const income  = parseFloat(summary?.total_income  || 0);
  const expense = parseFloat(summary?.total_expense || 0);
  const balance = income - expense;
  const pieData = (summary?.by_category || []).map(c => ({ name: c.name, value: parseFloat(c.total) }));

  const statCards = [
    { label: 'Tổng số dư', value: balance, icon: Wallet,      color: '#6366f1', cls: balance >= 0 ? 'amount-income' : 'amount-expense' },
    { label: 'Tổng thu nhập',  value: income,  icon: TrendingUp,  color: '#10b981', cls: 'amount-income' },
    { label: 'Tổng chi phí', value: expense, icon: TrendingDown,color: '#ef4444', cls: 'amount-expense' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tổng quan</h1>
        <input type="month" className="form-input" style={{ maxWidth: 180 }}
          value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      {/* Budget Alerts */}
      {budgets.filter(b => parseFloat(b.spent) > parseFloat(b.amount)).length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: 24, background: '#fef2f2' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <AlertTriangle color="var(--danger)" size={20} />
            <div>
              <h4 style={{ color: '#991b1b', margin: 0, fontSize: '0.95rem' }}>Cảnh báo ngân sách</h4>
              <p style={{ color: '#b91c1c', margin: '2px 0 0', fontSize: '0.85rem' }}>
                Các danh mục sau đã chi vượt mức cho phép: {' '}
                {budgets.filter(b => parseFloat(b.spent) > parseFloat(b.amount))
                  .map(b => b.category_name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, cls }) => (
          <div className="stat-card card" key={label} style={{ '--accent-color': color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="label">{label}</div>
                <div className={`amount ${cls}`}>{formatCurrency(value)}</div>
                <div className="delta">{summary?.transaction_count ?? 0} giao dịch tháng này</div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Expense by category pie */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Chi phí theo danh mục</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>Không có dữ liệu</p></div>}
        </div>

        {/* Thu nhập vs Chi phí bar */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Thu nhập vs Chi phí</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ name: month, 'Thu nhập': income, 'Chi phí': expense }]} barGap={8}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="Thu nhập"  fill="#10b981" radius={[6,6,0,0]} />
              <Bar dataKey="Chi phí" fill="#ef4444" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Giao dịch gần đây</h3>
        {recent.length === 0 ? (
          <div className="empty-state"><p>Không có giao dịch nào trong tháng này</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mô tả</th><th>Danh mục</th><th>Ngày</th><th>Trạng thái</th><th>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(tx => (
                  <tr key={tx.id}>
                    <td>{tx.description || '—'}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
