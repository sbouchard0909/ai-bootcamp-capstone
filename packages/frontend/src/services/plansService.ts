import api from './api';
import { ApiSuccessResponse } from '../types/api';
import { CreatePlanData, UpdatePlanData, VacationPlan } from '../types/plans';

interface GetAllPlansResponse {
  plans: VacationPlan[];
}

interface PlanResponse {
  plan: VacationPlan;
}

export const plansService = {
  async getAll(): Promise<VacationPlan[]> {
    const response = await api.get<ApiSuccessResponse<GetAllPlansResponse>>('/api/v1/plans');
    return response.data.data.plans;
  },

  async getById(id: string): Promise<VacationPlan> {
    const response = await api.get<ApiSuccessResponse<PlanResponse>>(`/api/v1/plans/${id}`);
    return response.data.data.plan;
  },

  async create(data: CreatePlanData): Promise<VacationPlan> {
    const response = await api.post<ApiSuccessResponse<PlanResponse>>('/api/v1/plans', data);
    return response.data.data.plan;
  },

  async update(id: string, data: UpdatePlanData): Promise<VacationPlan> {
    const response = await api.put<ApiSuccessResponse<PlanResponse>>(`/api/v1/plans/${id}`, data);
    return response.data.data.plan;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/v1/plans/${id}`);
  },
};
