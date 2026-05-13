import { Router } from 'express';
import healthRoutes from './health';
import apiRoutes from './api';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/api/v1', apiRoutes);

export default router;
