// backend/src/middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = [
  helmet(),
  compression(),
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
  // Remove X-Powered-By header
  (_req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('X-Powered-By');
    next();
  },
];
