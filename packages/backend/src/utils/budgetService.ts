import {
  getActivityCostByCategory,
  getActivityCostByDate,
  getMostExpensiveActivitiesByPlanId,
  getTotalActivityCostByPlanId,
} from './activityDb';

export interface BudgetSummary {
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  costByCategory: Record<string, number>;
  warnings: string[];
}

export function getTotalSpent(planId: string): number {
  return getTotalActivityCostByPlanId(planId);
}

export function getCostByCategory(planId: string): Record<string, number> {
  return getActivityCostByCategory(planId);
}

export function getCostByDate(planId: string): Record<string, number> {
  return getActivityCostByDate(planId);
}

export function getMostExpensiveActivities(planId: string, limit = 5) {
  return getMostExpensiveActivitiesByPlanId(planId, limit);
}

export function isOverBudget(planId: string, budget: number): boolean {
  return getTotalSpent(planId) > budget;
}

export function getBudgetWarnings(totalSpent: number, budget: number): string[] {
  const warnings: string[] = [];

  if (budget <= 0) {
    return warnings;
  }

  const utilization = (totalSpent / budget) * 100;

  if (utilization >= 80) {
    warnings.push('Budget usage has reached 80% or more');
  }

  if (utilization > 100) {
    warnings.push('Plan is over budget');
  }

  return warnings;
}

export function calculateBudgetUtilization(totalSpent: number, budget: number): number {
  if (budget <= 0) {
    return 0;
  }

  return Number(((totalSpent / budget) * 100).toFixed(2));
}

export function buildBudgetSummary(planId: string, budget: number): BudgetSummary {
  const totalSpent = getTotalSpent(planId);
  const remainingBudget = Number((budget - totalSpent).toFixed(2));
  const budgetUtilization = calculateBudgetUtilization(totalSpent, budget);

  return {
    totalSpent,
    remainingBudget,
    budgetUtilization,
    costByCategory: getCostByCategory(planId),
    warnings: getBudgetWarnings(totalSpent, budget),
  };
}
