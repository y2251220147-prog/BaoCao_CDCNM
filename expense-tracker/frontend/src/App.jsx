import { Routes, Route } from 'react-router-dom';
import Sidebar      from './components/Sidebar';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories   from './pages/Categories';
import Budgets      from './pages/Budgets';
import Goals        from './pages/Goals';
import HealthCheck  from './pages/HealthCheck';

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"             element={<Dashboard />}    />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories"   element={<Categories />}   />
          <Route path="/budgets"      element={<Budgets />}      />
          <Route path="/goals"        element={<Goals />}        />
          <Route path="/health"       element={<HealthCheck />}  />
        </Routes>
      </main>
    </div>
  );
}
