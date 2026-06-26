// backend/src/controllers/satelliteController.ts
import type { Request, Response, NextFunction } from 'express';
import { fetchActiveSatellites, getSatelliteById } from '../services/satelliteService';

export async function getSatellites(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const satellites = await fetchActiveSatellites();
    res.json(satellites);
  } catch (err) {
    next(err);
  }
}

export async function getSatelliteByIdCtrl(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sat = await getSatelliteById(req.params.id);
    if (!sat) {
      res.status(404).json({ error: 'Satellite not found' });
      return;
    }
    res.json(sat);
  } catch (err) {
    next(err);
  }
}
