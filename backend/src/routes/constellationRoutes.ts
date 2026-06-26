import { Router } from 'express';
import { constellationController } from '../controllers/constellationController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.get('/', apiRateLimiter, constellationController);
export default router;
