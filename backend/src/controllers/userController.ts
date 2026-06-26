import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }
  try {
    const user = await userService.getUserById(userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) { next(err); }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }
  try {
    const updated = await userService.updateUser(userId, req.body);
    res.json(updated);
  } catch (err) { next(err); }
}
