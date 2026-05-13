export const VACATION_PLAN_STATUSES = [
  'planning',
  'upcoming',
  'active',
  'completed',
  'cancelled',
] as const;

export type VacationPlanStatus = (typeof VACATION_PLAN_STATUSES)[number];

export interface VacationPlan {
  id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string | null;
  status: VacationPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVacationPlanInput {
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  description?: string;
  status?: VacationPlanStatus;
}

export interface UpdateVacationPlanInput {
  name?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  status?: VacationPlanStatus;
}
