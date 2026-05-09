import { Routes, Route } from 'react-router-dom';
import Sidebar       from './components/Sidebar';
import Dashboard     from './pages/Dashboard';
import Transactions  from './pages/Transactions';
import Categories    from './pages/Categories';
import Budgets       from './pages/Budgets';
import HealthCheck   from './pages/HealthCheck';
import Challenges    from './pages/Challenges';
import MoodAnalysis  from './pages/MoodAnalysis';

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"             element={<Dashboard />}     />
          <Route path="/transactions" element={<Transactions />}  />
          <Route path="/categories"   element={<Categories />}    />
          <Route path="/budgets"      element={<Budgets />}       />
          <Route path="/challenges"   element={<Challenges />}    />
          <Route path="/mood"         element={<MoodAnalysis />}  />
          <Route path="/health"       element={<HealthCheck />}   />
        </Routes>
      </main>
    </div>
  );
}
