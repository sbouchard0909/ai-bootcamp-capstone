import { Router } from 'express';
import authRoutes from './auth';
import plansRoutes from './plans';

const router = Router();

/**
 * API v1 routes
 * All API routes will be mounted here
 */

// Auth routes
router.use('/auth', authRoutes);
router.use('/plans', plansRoutes);

// Future routes will be added here:
// etc.

export default router;
