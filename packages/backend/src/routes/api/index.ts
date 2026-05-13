import { Router } from 'express';
import authRoutes from './auth';
import plansRoutes from './plans';
import dashboardRoutes from './dashboard';

const router = Router();

/**
 * API v1 routes
 * All API routes will be mounted here
 */

// Auth routes
router.use('/auth', authRoutes);
router.use('/plans', plansRoutes);
router.use('/dashboard', dashboardRoutes);

// Future routes will be added here:
// etc.

export default router;
