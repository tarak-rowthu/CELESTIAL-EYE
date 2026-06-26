import { Router } from 'express';
import { predictorController } from '../services/predictorService';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.get('/', apiRateLimiter, predictorController);
export default router;
