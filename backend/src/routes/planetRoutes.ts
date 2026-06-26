import { Router } from 'express';
import { planetController } from '../controllers/planetController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.get('/', apiRateLimiter, planetController);
export default router;
