import api from './api';
import { User } from '../types/auth';

interface RegisterResponse {
  data: { user: User };
}

interface LoginResponse {
  data: { token: string; user: User };
}

interface MeResponse {
  data: { user: User };
}

export const authService = {
  async register(email: string, password: string, name: string): Promise<User> {
    const response = await api.post<RegisterResponse>('/api/v1/auth/register', {
      email,
      password,
      name,
    });
    return response.data.data.user;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<MeResponse>('/api/v1/auth/me');
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout');
  },
};
