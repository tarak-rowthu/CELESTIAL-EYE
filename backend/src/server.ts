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

// Security
app.use(helmet());

// CORS Configuration
const allowedOrigins = (process.env.FRONTEND_ORIGIN?.split(',') ?? ['http://localhost:3000', 'http://localhost:5173']);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS Error: Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(compression() as any);
app.use(json());
app.use(urlencoded({ extended: true }));

// Rate Limiter
app.use(apiRateLimiter);

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Celestial Eye Backend Running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/iss', issRoutes);
app.use('/api/satellites', satelliteRoutes);
app.use('/api/planets', planetRoutes);
app.use('/api/constellations', constellationRoutes);
app.use('/api/predictor', predictorRoutes);
app.use('/api/object', objectRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Celestial Eye Backend running on http://0.0.0.0:${PORT}`);
});

export default app;