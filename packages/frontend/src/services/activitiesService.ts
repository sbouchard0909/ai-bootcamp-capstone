import api from './api';
import { ApiSuccessResponse } from '../types/api';
import { Activity, CreateActivityData, UpdateActivityData } from '../types/activities';

interface GetAllActivitiesResponse {
  activities: Activity[];
}

interface ActivityResponse {
  activity: Activity;
}

export const activitiesService = {
  async getAll(planId: string): Promise<Activity[]> {
    const response = await api.get<ApiSuccessResponse<GetAllActivitiesResponse>>(`/api/v1/plans/${planId}/activities`);
    return response.data.data.activities;
  },

  async getById(planId: string, id: string): Promise<Activity> {
    const response = await api.get<ApiSuccessResponse<ActivityResponse>>(`/api/v1/plans/${planId}/activities/${id}`);
    return response.data.data.activity;
  },

  async create(planId: string, data: CreateActivityData): Promise<Activity> {
    const response = await api.post<ApiSuccessResponse<ActivityResponse>>(`/api/v1/plans/${planId}/activities`, data);
    return response.data.data.activity;
  },

  async update(planId: string, id: string, data: UpdateActivityData): Promise<Activity> {
    const response = await api.put<ApiSuccessResponse<ActivityResponse>>(`/api/v1/plans/${planId}/activities/${id}`, data);
    return response.data.data.activity;
  },

  async delete(planId: string, id: string): Promise<void> {
    await api.delete(`/api/v1/plans/${planId}/activities/${id}`);
  },
};
