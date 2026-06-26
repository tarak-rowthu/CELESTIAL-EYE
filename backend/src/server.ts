import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { json, urlencoded } from 'body-parser';

import authRoutes from './routes/authRoutes';
import locationRoutes from './routes/locationRoutes';
import issRoutes from './routes/issRoutes';
import satelliteRoutes from './routes/satelliteRoutes';
import planetRoutes from './routes/planetRoutes';
import constellationRoutes from './routes/constellationRoutes';
import predictorRoutes from './routes/predictorRoutes';
import objectRoutes from './routes/objectRoutes';
import favoritesRoutes from './routes/favoritesRoutes';
import historyRoutes from './routes/historyRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression() as any);
app.use(json());
app.use(urlencoded({ extended: true }));

// Apply rate limiter to all routes
app.use(apiRateLimiter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/iss', issRoutes);
app.use('/api/satellites', satelliteRoutes);
app.use('/api/planets', planetRoutes);
app.use('/api/constellations', constellationRoutes);
app.use('/api/predictor', predictorRoutes);
app.use('/api/object', objectRoutes);

// Protected routes (JWT required)
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '4000', 10);
app.listen(PORT, () => {
  console.log(`🚀 Celestial Eye Backend running on http://localhost:${PORT}`);
});

export default app;
