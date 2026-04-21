import { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function HealthCheck() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const check = () => {
    setLoading(true);
    setError(null);
    checkHealth()
      .then(r => { setData(r.data); })
      .catch(e => { setError(e.message || 'Không thể kết nối với API'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { check(); }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kiểm tra API Check</h1>
        <button className="btn btn-ghost" onClick={check} disabled={loading} id="btn-refresh-health">
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 720 }}>
        {/* Status card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {loading ? (
              <Activity size={40} color="var(--text-muted)" />
            ) : error ? (
              <XCircle size={40} color="var(--danger)" />
            ) : (
              <CheckCircle size={40} color="var(--success)" />
            )}
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {loading ? 'Đang kiểm tra…' : error ? 'CÓ LỖI' : 'BÌNH THƯỜNG'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                GET /api/health
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        {!loading && !error && data && (
          <>
            {[
              { label: 'Dịch vụ',   value: data.service },
              { label: 'Phiên bản',   value: data.version },
              { label: 'Trạng thái',    value: data.status },
              { label: 'Thời gian', value: new Date(data.timestamp).toLocaleString('vi-VN') },
            ].map(({ label, value }) => (
              <div className="card" key={label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.8px' }}>
                  {label}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{value}</div>
              </div>
            ))}
          </>
        )}

        {error && (
          <div className="card" style={{ gridColumn: '1 / -1', borderColor: 'rgba(239,68,68,0.3)' }}>
            <div style={{ color: 'var(--danger)', fontWeight: 600 }}>{error}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>
              Hãy đảm bảo backend đang chạy trên port 5000.
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
