import { NextFunction, Request, Response, Router } from 'express';
import {
  VACATION_PLAN_STATUSES,
  VacationPlan,
  VacationPlanStatus,
} from '../../models/VacationPlan';
import { authenticateToken } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { sendSuccess } from '../../utils/response';
import {
  createVacationPlan,
  deleteVacationPlanById,
  findVacationPlanById,
  getVacationPlansByUserId,
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

function assertOwnership(plan: VacationPlan, userId: string): void {
  if (plan.userId !== userId) {
    throw new AppError('Forbidden', 403);
  }
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

    const plans = getVacationPlansByUserId(req.user.userId).map(withDuration);
    return sendSuccess(res, { plans }, 200);
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
    return sendSuccess(res, { plan: withDuration(plan) }, 200);
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
