import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { authService } from '../src/services/authService';

vi.mock('../src/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

function Harness() {
  const { isAuthenticated, token, user, login, logout, loading } = useAuth();

  return (
    <div>
      <p>loading:{String(loading)}</p>
      <p>authenticated:{String(isAuthenticated)}</p>
      <p>token:{token || 'none'}</p>
      <p>user:{user?.email || 'none'}</p>
      <button onClick={() => void login('user@example.com', 'password123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('no session'));
  });

  it('initial state is not authenticated', async () => {
    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('authenticated:false')).toBeInTheDocument();
    });
  });

  it('login updates user and token state and persists token', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'jwt-token',
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('authenticated:true')).toBeInTheDocument();
      expect(screen.getByText('token:jwt-token')).toBeInTheDocument();
      expect(screen.getByText('user:user@example.com')).toBeInTheDocument();
      expect(localStorage.getItem('auth_token')).toBe('jwt-token');
    });
  });

  it('logout clears user and token', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'jwt-token',
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('authenticated:true')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByText('authenticated:false')).toBeInTheDocument();
      expect(screen.getByText('token:none')).toBeInTheDocument();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  it('loads token from localStorage on mount', async () => {
    localStorage.setItem('auth_token', 'saved-token');

    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: '1',
      email: 'saved@example.com',
      name: 'Saved',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });

    render(
      <AuthProvider>
        <Harness />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('authenticated:true')).toBeInTheDocument();
      expect(screen.getByText('token:saved-token')).toBeInTheDocument();
      expect(screen.getByText('user:saved@example.com')).toBeInTheDocument();
    });
  });
});
