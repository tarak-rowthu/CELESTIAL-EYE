// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter – 60 requests per minute per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
