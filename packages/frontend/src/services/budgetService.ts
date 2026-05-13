import api from './api';
import { ApiSuccessResponse } from '../types/api';
import { BudgetDetails } from '../types/plans';

interface RawBudgetDetailsResponse {
  budget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  costByCategory: Record<string, number>;
  costByDate: Record<string, number>;
  warnings: string[];
}

export const budgetService = {
  async getBudgetDetails(planId: string): Promise<BudgetDetails> {
    const response = await api.get<ApiSuccessResponse<RawBudgetDetailsResponse>>(
      `/api/v1/plans/${planId}/budget`
    );

    const payload = response.data.data;

    return {
      totalBudget: payload.budget,
      totalSpent: payload.totalSpent,
      remainingBudget: payload.remainingBudget,
      budgetUtilization: payload.budgetUtilization,
      costByCategory: payload.costByCategory,
      costByDate: payload.costByDate,
      warnings: payload.warnings,
      isOverBudget: payload.remainingBudget < 0,
    };
  },
};
