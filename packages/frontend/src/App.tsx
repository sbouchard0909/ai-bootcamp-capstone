import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlansProvider } from './context/PlansContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlanDetailsPage } from './pages/PlanDetailsPage';
import { PlanFormPage } from './pages/PlanFormPage';
import { PlansListPage } from './pages/PlansListPage';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="border-b bg-white px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-semibold">Travel Planning App</Link>

      <div className="flex items-center gap-4">
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <Link to="/plans">Plans</Link>
            <span aria-label="current-user">{user?.email}</span>
            <button onClick={logout} className="px-3 py-1 bg-gray-200 rounded">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedPlansLayout() {
  return (
    <PrivateRoute>
      <PlansProvider>
        <Outlet />
      </PlansProvider>
    </PrivateRoute>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route element={<ProtectedPlansLayout />}>
        <Route path="/plans" element={<PlansListPage />} />
        <Route path="/plans/new" element={<PlanFormPage />} />
        <Route path="/plans/:id" element={<PlanDetailsPage />} />
        <Route path="/plans/:id/edit" element={<PlanFormPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
