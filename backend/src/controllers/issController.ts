// backend/src/controllers/issController.ts
import type { Request, Response, NextFunction } from 'express';
import { getISSPosition } from '../services/issService';

export async function issController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const position = await getISSPosition();
    res.json(position);
  } catch (err) {
    next(err);
  }
}
