// Re-exports all public celestial endpoints under /api/celestial/* for backwards compat
import { Router } from 'express';
import issRoutes from './issRoutes';
import satelliteRoutes from './satelliteRoutes';
import planetRoutes from './planetRoutes';
import constellationRoutes from './constellationRoutes';
import predictorRoutes from './predictorRoutes';
import objectRoutes from './objectRoutes';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use('/iss', issRoutes);
router.use('/satellites', satelliteRoutes);
router.use('/planets', planetRoutes);
router.use('/constellations', constellationRoutes);
router.use('/predictor', predictorRoutes);
router.use('/object', objectRoutes);
export default router;
