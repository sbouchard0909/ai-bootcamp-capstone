import { NextFunction, Request, Response, Router } from 'express';
import { ACTIVITY_CATEGORIES, Activity, ActivityCategory } from '../../models/Activity';
import { UpdateActivityInput } from '../../models/Activity';
import {
  VACATION_PLAN_STATUSES,
  VacationPlan,
  VacationPlanStatus,
} from '../../models/VacationPlan';
import { authenticateToken } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import {
  createActivity,
  deleteActivityByIdAndPlanId,
  findActivityByIdAndPlanId,
  getActivitiesByPlanId,
  updateActivityByIdAndPlanId,
} from '../../utils/activityDb';
import {
  buildBudgetSummary,
  getCostByDate,
  getMostExpensiveActivities,
} from '../../utils/budgetService';
import {
  createVacationPlan,
  deleteVacationPlanById,
  findVacationPlanById,
  getVacationPlansByUserId,
  touchVacationPlanUpdatedAt,
  updateVacationPlanById,
} from '../../utils/planDb';
import { validateRequiredFields } from '../../utils/validation';

const router = Router();

function isValidDateOnly(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const parsed = new Date(`${dateString}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime());
}

function validatePlanDates(startDate: string, endDate: string): void {
  if (!isValidDateOnly(startDate) || !isValidDateOnly(endDate)) {
    throw new AppError('startDate and endDate must be valid ISO dates (YYYY-MM-DD)', 400);
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  if (end < start) {
    throw new AppError('endDate must be after startDate', 400);
  }
}

function validatePlanStatus(status: unknown): status is VacationPlanStatus {
  return typeof status === 'string' && VACATION_PLAN_STATUSES.includes(status as VacationPlanStatus);
}

function validatePlanCreatePayload(body: Record<string, unknown>): void {
  const { name, destination, startDate, endDate, budget, status } = body;

  const missingField = validateRequiredFields({ name, destination, startDate, endDate, budget });
  if (missingField) {
    throw new AppError(missingField, 400);
  }

  if (typeof name !== 'string' || name.length > 200) {
    throw new AppError('Name must be 200 characters or fewer', 400);
  }

  if (typeof budget !== 'number' || Number.isNaN(budget) || budget <= 0) {
    throw new AppError('Budget must be a positive number', 400);
  }

  validatePlanDates(String(startDate), String(endDate));

  const todayIso = new Date().toISOString().split('T')[0];
  if (String(startDate) < todayIso) {
    throw new AppError('startDate cannot be in the past', 400);
  }

  if (status !== undefined && !validatePlanStatus(status)) {
    throw new AppError('status must be one of: planning, upcoming, active, completed, cancelled', 400);
  }
}

function validatePlanUpdatePayload(body: Record<string, unknown>): void {
  const { name, destination, startDate, endDate, budget, status } = body;

  if (name !== undefined && (typeof name !== 'string' || name.length > 200)) {
    throw new AppError('Name must be 200 characters or fewer', 400);
  }

  if (destination !== undefined && (typeof destination !== 'string' || destination.trim() === '')) {
    throw new AppError('destination is required', 400);
  }

  if (budget !== undefined && (typeof budget !== 'number' || Number.isNaN(budget) || budget <= 0)) {
    throw new AppError('Budget must be a positive number', 400);
  }

  if (status !== undefined && !validatePlanStatus(status)) {
    throw new AppError('status must be one of: planning, upcoming, active, completed, cancelled', 400);
  }

  if (startDate !== undefined || endDate !== undefined) {
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      throw new AppError('startDate and endDate must be provided together', 400);
    }

    validatePlanDates(startDate, endDate);
  }
}

function getDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const millisecondsInDay = 1000 * 60 * 60 * 24;

  return Math.floor((end.getTime() - start.getTime()) / millisecondsInDay) + 1;
}

function withDuration(plan: VacationPlan): VacationPlan & { durationDays: number } {
  return {
    ...plan,
    durationDays: getDurationDays(plan.startDate, plan.endDate),
  };
}

function withBudget(plan: VacationPlan): VacationPlan & {
  durationDays: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  costByCategory: Record<string, number>;
  warnings: string[];
} {
  const budget = buildBudgetSummary(plan.id, plan.budget);

  return {
    ...withDuration(plan),
    totalSpent: budget.totalSpent,
    remainingBudget: budget.remainingBudget,
    budgetUtilization: budget.budgetUtilization,
    costByCategory: budget.costByCategory,
    warnings: budget.warnings,
  };
}

function assertOwnership(plan: VacationPlan, userId: string): void {
  if (plan.userId !== userId) {
    throw new AppError('Forbidden', 403);
  }
}

function ensurePlanAccess(planId: string, userId: string): VacationPlan {
  const plan = findVacationPlanById(planId);
  if (!plan) {
    throw new AppError('Plan not found', 404);
  }

  assertOwnership(plan, userId);
  return plan;
}

function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

function validateActivityDateWithinPlan(date: string, plan: VacationPlan): void {
  if (!isValidDateOnly(date)) {
    throw new AppError('date must be valid ISO date (YYYY-MM-DD)', 400);
  }

  if (date < plan.startDate || date > plan.endDate) {
    throw new AppError('Activity date must be within plan date range', 400);
  }
}

function validateActivityCategory(category: unknown): category is ActivityCategory {
  return typeof category === 'string' && ACTIVITY_CATEGORIES.includes(category as ActivityCategory);
}

function validateActivityTimeRange(startTime?: string, endTime?: string): void {
  if (startTime !== undefined && !isValidTime(startTime)) {
    throw new AppError('startTime must be valid HH:MM', 400);
  }

  if (endTime !== undefined && !isValidTime(endTime)) {
    throw new AppError('endTime must be valid HH:MM', 400);
  }

  if (startTime && endTime && endTime <= startTime) {
    throw new AppError('endTime must be after startTime', 400);
  }
}

function validateCreateActivityPayload(body: Record<string, unknown>, plan: VacationPlan): void {
  const { name, date, cost, category, startTime, endTime } = body;
  const missingField = validateRequiredFields({ name, date, cost, category });
  if (missingField) {
    throw new AppError(missingField, 400);
  }

  if (typeof name !== 'string' || name.length > 200) {
    throw new AppError('Name must be 200 characters or fewer', 400);
  }

  if (typeof cost !== 'number' || Number.isNaN(cost) || cost < 0) {
    throw new AppError('Cost must be a non-negative number', 400);
  }

  if (!validateActivityCategory(category)) {
    throw new AppError(
      'category must be one of: dining, sightseeing, accommodation, transport, entertainment, other',
      400
    );
  }

  if (startTime !== undefined && typeof startTime !== 'string') {
    throw new AppError('startTime must be valid HH:MM', 400);
  }

  if (endTime !== undefined && typeof endTime !== 'string') {
    throw new AppError('endTime must be valid HH:MM', 400);
  }

  validateActivityDateWithinPlan(String(date), plan);
  validateActivityTimeRange(
    typeof startTime === 'string' ? startTime : undefined,
    typeof endTime === 'string' ? endTime : undefined
  );
}

function validateUpdateActivityPayload(
  body: Record<string, unknown>,
  plan: VacationPlan,
  existing: Activity
): void {
  const merged = {
    ...existing,
    ...body,
  };

  if (merged.name === undefined || typeof merged.name !== 'string' || merged.name.length > 200) {
    throw new AppError('Name must be 200 characters or fewer', 400);
  }

  if (
    merged.cost === undefined ||
    typeof merged.cost !== 'number' ||
    Number.isNaN(merged.cost) ||
    merged.cost < 0
  ) {
    throw new AppError('Cost must be a non-negative number', 400);
  }

  if (!validateActivityCategory(merged.category)) {
    throw new AppError(
      'category must be one of: dining, sightseeing, accommodation, transport, entertainment, other',
      400
    );
  }

  validateActivityDateWithinPlan(String(merged.date), plan);

  const startTime = typeof merged.startTime === 'string' ? merged.startTime : undefined;
  const endTime = typeof merged.endTime === 'string' ? merged.endTime : undefined;
  validateActivityTimeRange(startTime, endTime);
}

function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {});
}

router.use(authenticateToken);

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    validatePlanCreatePayload(req.body as Record<string, unknown>);

    const payload = req.body as {
      name: string;
      destination: string;
      startDate: string;
      endDate: string;
      budget: number;
      description?: string;
      status?: VacationPlanStatus;
    };

    const plan = createVacationPlan({
      userId: req.user.userId,
      name: payload.name,
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      budget: payload.budget,
      description: payload.description,
      status: payload.status,
    });

    return sendSuccess(res, { plan: withDuration(plan) }, 201);
  } catch (error) {
    next(error);
  }
});

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plans = getVacationPlansByUserId(req.user.userId).map(withBudget);
    return sendSuccess(res, { plans }, 200);
  } catch (error) {
    next(error);
  }
});

router.post('/:planId/activities', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = ensurePlanAccess(req.params.planId, req.user.userId);
    validateCreateActivityPayload(req.body as Record<string, unknown>, plan);

    const payload = req.body as {
      name: string;
      date: string;
      startTime?: string;
      endTime?: string;
      cost: number;
      category: ActivityCategory;
      description?: string;
      location?: string;
    };

    const activity = createActivity({
      planId: plan.id,
      name: payload.name,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      cost: payload.cost,
      category: payload.category,
      description: payload.description,
      location: payload.location,
    });

    touchVacationPlanUpdatedAt(plan.id);

    const budget = buildBudgetSummary(plan.id, plan.budget);

    return sendSuccess(res, { activity, warnings: budget.warnings }, 201);
  } catch (error) {
    next(error);
  }
});

router.get('/:planId/activities', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = ensurePlanAccess(req.params.planId, req.user.userId);
    const activities = getActivitiesByPlanId(plan.id);
    const groupedByDate = groupActivitiesByDate(activities);
    const budget = buildBudgetSummary(plan.id, plan.budget);

    return sendSuccess(
      res,
      {
        activities,
        groupedByDate,
        totalCost: budget.totalSpent,
        remainingBudget: budget.remainingBudget,
        budgetUtilization: budget.budgetUtilization,
        costByCategory: budget.costByCategory,
        warnings: budget.warnings,
      },
      200
    );
  } catch (error) {
    next(error);
  }
});

router.get('/:planId/activities/:activityId', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = ensurePlanAccess(req.params.planId, req.user.userId);
    const activity = findActivityByIdAndPlanId(req.params.activityId, plan.id);
    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    return sendSuccess(res, { activity }, 200);
  } catch (error) {
    next(error);
  }
});

router.put('/:planId/activities/:activityId', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = ensurePlanAccess(req.params.planId, req.user.userId);
    const existing = findActivityByIdAndPlanId(req.params.activityId, plan.id);
    if (!existing) {
      throw new AppError('Activity not found', 404);
    }

    const sanitizedUpdates = { ...req.body } as Record<string, unknown>;
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.planId;

    validateUpdateActivityPayload(sanitizedUpdates, plan, existing);

    const updateInput: UpdateActivityInput = {};

    if (sanitizedUpdates.name !== undefined) {
      updateInput.name = sanitizedUpdates.name as string;
    }

    if (sanitizedUpdates.date !== undefined) {
      updateInput.date = sanitizedUpdates.date as string;
    }

    if (sanitizedUpdates.startTime !== undefined) {
      updateInput.startTime = sanitizedUpdates.startTime as string | null;
    }

    if (sanitizedUpdates.endTime !== undefined) {
      updateInput.endTime = sanitizedUpdates.endTime as string | null;
    }

    if (sanitizedUpdates.cost !== undefined) {
      updateInput.cost = sanitizedUpdates.cost as number;
    }

    if (sanitizedUpdates.category !== undefined) {
      updateInput.category = sanitizedUpdates.category as ActivityCategory;
    }

    if (sanitizedUpdates.description !== undefined) {
      updateInput.description = sanitizedUpdates.description as string;
    }

    if (sanitizedUpdates.location !== undefined) {
      updateInput.location = sanitizedUpdates.location as string;
    }

    const updated = updateActivityByIdAndPlanId(req.params.activityId, plan.id, updateInput);

    if (!updated) {
      throw new AppError('Activity not found', 404);
    }

    touchVacationPlanUpdatedAt(plan.id);

    const refreshedPlan = ensurePlanAccess(plan.id, req.user.userId);
    const budget = buildBudgetSummary(refreshedPlan.id, refreshedPlan.budget);

    return sendSuccess(res, { activity: updated, warnings: budget.warnings }, 200);
  } catch (error) {
    next(error);
  }
});

router.delete('/:planId/activities/:activityId', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = ensurePlanAccess(req.params.planId, req.user.userId);
    const existing = findActivityByIdAndPlanId(req.params.activityId, plan.id);
    if (!existing) {
      throw new AppError('Activity not found', 404);
    }

    deleteActivityByIdAndPlanId(req.params.activityId, plan.id);
    touchVacationPlanUpdatedAt(plan.id);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = findVacationPlanById(req.params.id);
    if (!plan) {
      throw new AppError('Plan not found', 404);
    }

    assertOwnership(plan, req.user.userId);
    return sendSuccess(res, { plan: withBudget(plan) }, 200);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/budget', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const plan = ensurePlanAccess(req.params.id, req.user.userId);
    const budget = buildBudgetSummary(plan.id, plan.budget);

    return sendSuccess(
      res,
      {
        budget: plan.budget,
        totalSpent: budget.totalSpent,
        remainingBudget: budget.remainingBudget,
        budgetUtilization: budget.budgetUtilization,
        costByCategory: budget.costByCategory,
        costByDate: getCostByDate(plan.id),
        warnings: budget.warnings,
        mostExpensiveActivities: getMostExpensiveActivities(plan.id),
      },
      200
    );
  } catch (error) {
    next(error);
  }
});

router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const existing = findVacationPlanById(req.params.id);
    if (!existing) {
      throw new AppError('Plan not found', 404);
    }

    assertOwnership(existing, req.user.userId);

    const sanitizedUpdates = { ...req.body } as Record<string, unknown>;
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.userId;

    validatePlanUpdatePayload(sanitizedUpdates);

    const mergedForDateValidation = {
      ...existing,
      ...sanitizedUpdates,
    };

    if (sanitizedUpdates.startDate !== undefined || sanitizedUpdates.endDate !== undefined) {
      validatePlanDates(mergedForDateValidation.startDate, mergedForDateValidation.endDate);
    }

    const updated = updateVacationPlanById(req.params.id, sanitizedUpdates);
    if (!updated) {
      throw new AppError('Plan not found', 404);
    }

    return sendSuccess(res, { plan: withDuration(updated) }, 200);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Authentication token is required', 401);
    }

    const existing = findVacationPlanById(req.params.id);
    if (!existing) {
      throw new AppError('Plan not found', 404);
    }

    assertOwnership(existing, req.user.userId);

    deleteVacationPlanById(req.params.id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
