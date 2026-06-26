import { Request, Response, NextFunction } from 'express';

export function requireRole(role: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next({ status: 401, message: 'Unauthenticated' });
    }
    if (user.role !== role) {
      return next({ status: 403, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}
