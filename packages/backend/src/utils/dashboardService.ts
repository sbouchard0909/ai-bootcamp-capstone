import { VacationPlan } from '../models/VacationPlan';
import { getVacationPlansByUserId, updateVacationPlanById } from './planDb';
import { getTotalSpent, buildBudgetSummary } from './budgetService';

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

interface EnrichedPlan extends VacationPlan {
  durationDays: number;
  totalSpent?: number;
  remainingBudget?: number;
  budgetUtilization?: number;
  costByCategory?: Record<string, number>;
  warnings?: string[];
}

/**
 * Calculate duration in days between start and end dates (inclusive)
 */
function calculateDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Enrich a plan with duration and budget information
 */
function enrichPlanWithBudgetInfo(plan: VacationPlan): EnrichedPlan {
  const durationDays = calculateDurationDays(plan.startDate, plan.endDate);
  const budgetSummary = buildBudgetSummary(plan.id, plan.budget);

  return {
    ...plan,
    durationDays,
    ...budgetSummary,
  };
}

/**
 * Auto-update plan status based on current date
 * - upcoming/planning → active when startDate <= today <= endDate
 * - active → completed when today > endDate
 * - cancelled plans are never auto-updated
 */
function autoUpdatePlanStatus(plan: VacationPlan, today: string): VacationPlan {
  // Never auto-update cancelled plans
  if (plan.status === 'cancelled') {
    return plan;
  }

  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const startDate = new Date(`${plan.startDate}T00:00:00.000Z`);
  const endDate = new Date(`${plan.endDate}T00:00:00.000Z`);

  // Update to active if start date has been reached and end date hasn't passed
  if (
    (plan.status === 'upcoming' || plan.status === 'planning') &&
    todayDate >= startDate &&
    todayDate <= endDate
  ) {
    const updatedPlan = updateVacationPlanById(plan.id, { status: 'active' });
    return updatedPlan || plan;
  }

  // Update to completed if end date has passed
  if (plan.status === 'active' && todayDate > endDate) {
    const updatedPlan = updateVacationPlanById(plan.id, { status: 'completed' });
    return updatedPlan || plan;
  }

  return plan;
}

/**
 * Get dashboard data for a user
 * - Groups plans by status (upcoming, active, completed)
 * - Calculates statistics
 * - Auto-updates plan statuses based on dates
 */
export function getDashboardData(userId: string): DashboardData {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Get all plans and auto-update statuses
  let plans = getVacationPlansByUserId(userId);
  plans = plans.map((plan) => autoUpdatePlanStatus(plan, today));

  // Enrich plans with budget info
  const enrichedPlans = plans.map((plan) => enrichPlanWithBudgetInfo(plan));

  // Group plans by status
  const upcomingPlans = enrichedPlans
    .filter((p) => p.status === 'upcoming' || p.status === 'planning')
    .sort((a, b) => a.startDate.localeCompare(b.startDate)); // Ascending (soonest first)

  const activePlans = enrichedPlans
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.endDate.localeCompare(b.endDate)); // Ascending (ending soonest first)

  const completedPlans = enrichedPlans
    .filter((p) => p.status === 'completed')
    .sort((a, b) => b.endDate.localeCompare(a.endDate)); // Descending (most recent first)

  // Calculate statistics
  const totalPlans = plans.length;
  const totalBudget = plans.reduce((sum, plan) => sum + plan.budget, 0);
  const totalSpent = plans.reduce((sum, plan) => {
    const spent = getTotalSpent(plan.id);
    return sum + spent;
  }, 0);

  // Count plans by status
  const plansByStatus: Record<string, number> = {};
  plans.forEach((plan) => {
    plansByStatus[plan.status] = (plansByStatus[plan.status] || 0) + 1;
  });

  return {
    upcomingPlans,
    activePlans,
    completedPlans,
    statistics: {
      totalPlans,
      totalBudget,
      totalSpent,
      plansByStatus,
    },
  };
}
