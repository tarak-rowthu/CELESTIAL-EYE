import { Router } from 'express';
import { getSatellites, getSatelliteByIdCtrl } from '../controllers/satelliteController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.get('/', apiRateLimiter, getSatellites);
router.get('/:id', apiRateLimiter, getSatelliteByIdCtrl);
export default router;
