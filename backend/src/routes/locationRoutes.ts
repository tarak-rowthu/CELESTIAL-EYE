// src/routes/locationRoutes.ts
import { Router } from 'express';
import { getLocationInfo } from '../controllers/locationController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/locations?lat=XX&lon=YY
router.get('/', apiRateLimiter, getLocationInfo);

export default router;

