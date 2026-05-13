import api from './api';
import { ApiSuccessResponse } from '../types/api';
import { DashboardData } from '../types/plans';

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<ApiSuccessResponse<DashboardData>>('/api/v1/dashboard');
    return response.data.data;
  },
};
