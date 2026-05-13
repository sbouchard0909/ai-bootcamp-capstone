export const PLAN_STATUSES = [
  'planning',
  'upcoming',
  'active',
  'completed',
  'cancelled',
] as const;

export type PlanStatus = (typeof PLAN_STATUSES)[number];

export interface VacationPlan {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string | null;
  status: PlanStatus;
  durationDays?: number;
  totalSpent?: number;
  remainingBudget?: number;
  budgetUtilization?: number;
  costByCategory?: Record<string, number>;
  warnings?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetDetails {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  costByCategory: Record<string, number>;
  costByDate: Record<string, number>;
  warnings: string[];
  isOverBudget: boolean;
}

export interface CreatePlanData {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  status?: PlanStatus;
}

export interface UpdatePlanData {
  name?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  status?: PlanStatus;
}

export interface DashboardStatistics {
  totalPlans: number;
  totalBudget: number;
  totalSpent: number;
  plansByStatus: Record<string, number>;
}

export interface DashboardData {
  upcomingPlans: VacationPlan[];
  activePlans: VacationPlan[];
  completedPlans: VacationPlan[];
  statistics: DashboardStatistics;
}
