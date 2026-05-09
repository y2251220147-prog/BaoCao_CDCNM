import { useEffect, useState } from 'react';
import { getMoodStats } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { SmilePlus, TrendingUp, ShoppingBag } from 'lucide-react';

const MOODS = [
  { value: 'happy',   emoji: '😊', label: 'Vui vẻ',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { value: 'sad',     emoji: '😭', label: 'Buồn bã',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { value: 'angry',   emoji: '😡', label: 'Tức giận',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  { value: 'tired',   emoji: '😴', label: 'Mệt mỏi',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { value: 'neutral', emoji: '😐', label: 'Bình thường',  color: '#64748b', bg: 'rgba(100,116,139,0.12)'},
];

const moodOf = (val) => MOODS.find(m => m.value === val) || { emoji: '❓', label: val, color: '#64748b', bg: '#f1f5f9' };

export default function MoodAnalysis() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth]     = useState('');
  const [activeMood, setActiveMood] = useState(null); // for drill-down

  useEffect(() => {
    setLoading(true);
    getMoodStats(month ? { month } : {})
      .then(r => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <p style={{ color: 'var(--text-muted)' }}>Đang phân tích cảm xúc… 🔍</p>
    </div>
  );

  const dist = stats?.distribution || [];
  const totalTx = dist.reduce((s, d) => s + parseInt(d.count), 0);
  const totalSpend = dist.reduce((s, d) => s + parseFloat(d.total_amount || 0), 0);

  // group by_category by mood
  const byMoodCat = {};
  (stats?.by_category || []).forEach(r => {
    if (!byMoodCat[r.mood]) byMoodCat[r.mood] = [];
    byMoodCat[r.mood].push(r);
  });

  const displayMood = activeMood || (dist[0]?.mood);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Phân tích cảm xúc 😶</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Khám phá mối liên hệ giữa cảm xúc và thói quen chi tiêu của bạn
          </p>
        </div>
        <input type="month" className="form-input" style={{ maxWidth: 180 }}
          value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      {dist.length === 0 ? (
        <div className="empty-state card">
          <SmilePlus size={48} style={{ opacity: 0.2, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
          <p style={{ textAlign: 'center' }}>Chưa có dữ liệu cảm xúc.<br />
            Hãy thêm giao dịch và chọn cảm xúc để bắt đầu thống kê!</p>
        </div>
      ) : (
        <>
          {/* Mood distribution cards */}
          <div className="mood-dist-grid">
            {MOODS.map(m => {
              const data = dist.find(d => d.mood === m.value);
              if (!data) return null;
              const pct = Math.round((data.count / totalTx) * 100);
              const isActive = displayMood === m.value;
              return (
                <div
                  key={m.value}
                  className={`mood-dist-card card ${isActive ? 'mood-active' : ''}`}
                  style={{ borderColor: isActive ? m.color : undefined, cursor: 'pointer' }}
                  onClick={() => setActiveMood(isActive ? null : m.value)}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{m.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: m.color }}>{m.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 6 }}>{data.count}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}> giao dịch</span>
                  </div>

                  {/* Mini bar */}
                  <div style={{ margin: '10px 0 6px', height: 6, background: 'var(--bg-card2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: m.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pct}% số giao dịch</div>
                  <div style={{ fontSize: '0.85rem', color: m.color, fontWeight: 600, marginTop: 6 }}>
                    {formatCurrency(data.avg_amount || 0)} / giao dịch
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight cards */}
          <div className="mood-insights-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '24px 0' }}>
            {/* Most spending mood */}
            {(() => {
              const top = [...dist].sort((a, b) => b.total_amount - a.total_amount)[0];
              const m = moodOf(top?.mood);
              return (
                <div className="card mood-insight-card" style={{ borderLeft: `4px solid ${m.color}` }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
                    <ShoppingBag size={12} style={{ marginRight: 4 }} /> CHI NHIỀU NHẤT KHI
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: m.color }}>{m.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Tổng: <strong>{formatCurrency(top?.total_amount)}</strong>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
                    💡 Bạn thường chi tiêu nhiều hơn khi đang ở trạng thái <strong>{m.label.toLowerCase()}</strong>. 
                    Hãy để ý và kiểm soát chi tiêu lúc này!
                  </p>
                </div>
              );
            })()}

            {/* Most frequent mood */}
            {(() => {
              const top = [...dist].sort((a, b) => b.count - a.count)[0];
              const m = moodOf(top?.mood);
              return (
                <div className="card mood-insight-card" style={{ borderLeft: `4px solid ${m.color}` }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>
                    <TrendingUp size={12} style={{ marginRight: 4 }} /> TRẠNG THÁI PHỔ BIẾN NHẤT
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '2rem' }}>{m.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: m.color }}>{m.label}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {top?.count} giao dịch ({Math.round((top?.count / totalTx) * 100)}%)
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
                    💡 Phần lớn các giao dịch của bạn được thực hiện khi đang cảm thấy <strong>{m.label.toLowerCase()}</strong>.
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Drill-down: categories for selected mood */}
          {displayMood && byMoodCat[displayMood] && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{moodOf(displayMood).emoji}</span>
                Khi <span style={{ color: moodOf(displayMood).color }}>"{moodOf(displayMood).label}"</span>&nbsp;bạn thường mua gì?
              </h3>
              <div className="mood-cat-list">
                {byMoodCat[displayMood].slice(0, 8).map((row, i) => {
                  const maxAmt = byMoodCat[displayMood][0]?.total_amount || 1;
                  const barW = Math.round((row.total_amount / maxAmt) * 100);
                  return (
                    <div key={i} className="mood-cat-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                        <span style={{
                          display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                          background: row.color, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{row.category_name}</span>
                      </div>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg-card2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barW}%`, background: row.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ minWidth: 100, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>
                        {formatCurrency(row.total_amount)}
                      </div>
                      <div style={{ minWidth: 50, textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {row.count} lần
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent transactions with mood */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Giao dịch gần đây có ghi cảm xúc</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Cảm xúc</th>
                    <th>Mô tả</th>
                    <th>Danh mục</th>
                    <th>Ngày</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recent || []).map(tx => {
                    const m = moodOf(tx.mood);
                    return (
                      <tr key={tx.id}>
                        <td>
                          <span style={{ fontSize: '1.3rem' }} title={m.label}>{m.emoji}</span>
                          <span style={{ fontSize: '0.78rem', color: m.color, marginLeft: 6, fontWeight: 600 }}>{m.label}</span>
                        </td>
                        <td>{tx.description || '—'}</td>
                        <td>
                          <span style={{
                            padding: '3px 10px', borderRadius: 8,
                            background: `${tx.color}22`, color: tx.color, fontSize: '0.82rem', fontWeight: 600,
                          }}>{tx.category_name}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(tx.date)}</td>
                        <td className={`amount-${tx.type}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
