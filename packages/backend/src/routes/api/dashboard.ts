import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth';
import { sendSuccess } from '../../utils/response';
import { getDashboardData } from '../../utils/dashboardService';

const router = Router();

/**
 * GET /api/v1/dashboard
 * Get user's dashboard data with upcoming, active, and completed plans
 */
router.get('/', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized', status: 401 } });
    }

    const dashboardData = getDashboardData(req.user.userId);

    return sendSuccess(res, dashboardData, 200);
  } catch (error) {
    next(error);
  }
});

export default router;
