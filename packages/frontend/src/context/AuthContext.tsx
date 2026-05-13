/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '../types/auth';
import { authService } from '../services/authService';
import { clearAuthToken, setAuthToken, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(storedToken);
        const currentUser = await authService.getCurrentUser();
        setToken(storedToken);
        setUser(currentUser);
      } catch (_error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, result.token);
    setAuthToken(result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (email: string, password: string, name: string) => {
    await authService.register(email, password, name);
    await login(email, password);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
