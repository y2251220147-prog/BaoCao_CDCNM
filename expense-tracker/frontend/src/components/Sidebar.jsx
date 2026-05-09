import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Tag, PiggyBank, Activity, Trophy, SmilePlus,
} from 'lucide-react';

const links = [
  { to: '/',             icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Giao dịch' },
  { to: '/categories',   icon: Tag,             label: 'Danh mục' },
  { to: '/budgets',      icon: PiggyBank,       label: 'Ngân sách' },
  { to: '/challenges',   icon: Trophy,          label: 'Thử thách 🏆', highlight: true },
  { to: '/mood',         icon: SmilePlus,       label: 'Cảm xúc 😶',   highlight: true },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">💰 ExpenseTracker</div>
      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${highlight ? ' nav-item-highlight' : ''}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '0 12px 8px' }}>
        <NavLink to="/health" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Activity size={18} />
          Kiểm tra API
        </NavLink>
      </div>
    </aside>
  );
}
