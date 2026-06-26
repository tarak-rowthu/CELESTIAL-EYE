import { Router } from 'express';
import { objectController } from '../controllers/objectController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.get('/:id', apiRateLimiter, objectController);
export default router;
