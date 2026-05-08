import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Tag, PiggyBank, Activity,
} from 'lucide-react';

const links = [
  { to: '/',             icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Giao dịch' },
  { to: '/categories',   icon: Tag,             label: 'Danh mục' },
  { to: '/budgets',      icon: PiggyBank,       label: 'Ngân sách' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">💰 ExpenseTracker</div>
      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '0 24px 8px' }}>
        <NavLink to="/health" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Activity size={18} />
          Kiểm tra API
        </NavLink>
      </div>

      <div className="sidebar-footer" style={{ 
        padding: '16px 24px', 
        borderTop: '1px solid var(--border)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
          ĐỒ ÁN DEVOPS
        </div>
        <div>Chủ đề: Expense Tracker</div>
        <div style={{ 
          marginTop: 8, 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 6,
          padding: '4px 8px',
          borderRadius: 4,
          background: '#e0f2fe',
          color: '#0369a1',
          fontWeight: 700,
          fontSize: '0.65rem',
          letterSpacing: '0.05em'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9' }}></div>
          DOCKERIZED
        </div>
      </div>
    </aside>
  );
}
