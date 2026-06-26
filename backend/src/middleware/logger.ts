// backend/src/middleware/logger.ts
import winston from 'winston';

// Simple Winston logger (used in errorHandler and server)
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// Express request logger middleware
export function requestLogger(req: any, res: any, next: any) {
  logger.info(`${req.method} ${req.path}`);
  next();
}
