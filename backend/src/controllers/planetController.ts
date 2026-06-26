// backend/src/controllers/planetController.ts
import type { Request, Response, NextFunction } from 'express';
import { getPlanets } from '../services/planetService';

export async function planetController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { lat, lon } = req.query as Record<string, string>;
  const latitude = lat !== undefined ? Number(lat) : undefined;
  const longitude = lon !== undefined ? Number(lon) : undefined;

  try {
    const planets = await getPlanets(latitude, longitude);
    res.json(planets);
  } catch (err) {
    next(err);
  }
}

