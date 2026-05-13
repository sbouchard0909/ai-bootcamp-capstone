import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

/**
 * API v1 routes
 * All API routes will be mounted here
 */

// Auth routes
router.use('/auth', authRoutes);

// Future routes will be added here:
// router.use('/plans', plansRoutes);
// etc.

export default router;
