import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '../src/components/PrivateRoute';

const mockUseAuth = vi.fn();

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderProtected() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <h1>Protected Content</h1>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PrivateRoute', () => {
  it('allows authenticated access', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    renderProtected();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    renderProtected();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('shows loading state while checking auth', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, loading: true });
    renderProtected();
    expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
  });
});
