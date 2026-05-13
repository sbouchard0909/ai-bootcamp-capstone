import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome, {user?.name || 'User'}.</p>
      <Link to="/plans" className="inline-block mt-4 text-blue-600">
        View vacation plans
      </Link>
    </div>
  );
}
