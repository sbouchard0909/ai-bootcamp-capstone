import { api } from './api';
import { DashboardData } from '../types/plans';

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard');
    return response;
  },
};
