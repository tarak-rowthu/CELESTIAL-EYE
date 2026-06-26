import { Router } from 'express';
import { issController } from '../controllers/issController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.get('/', apiRateLimiter, issController);
export default router;
