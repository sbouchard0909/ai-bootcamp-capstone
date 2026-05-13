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
  createdAt: string;
  updatedAt: string;
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
