// backend/src/controllers/constellationController.ts
import type { Request, Response, NextFunction } from 'express';
import { getVisibleConstellations } from '../services/starService';

/**
 * GET /api/constellations?lat=<number>&lon=<number>
 *
 * Returns all constellations visible above the horizon for the given location.
 */
export async function constellationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const latParam = typeof req.query.lat === 'string' ? req.query.lat : '';
  const lonParam = typeof req.query.lon === 'string' ? req.query.lon : '';

  if (latParam === '' || lonParam === '') {
    res.status(400).json({ error: 'Query params lat and lon are required.' });
    return;
  }

  const lat = Number(latParam);
  const lon = Number(lonParam);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ error: 'lat and lon must be finite decimal numbers.' });
    return;
  }

  try {
    // getVisibleConstellations is synchronous
    const constellations = getVisibleConstellations(lat, lon);
    res.json(constellations);
  } catch (err) {
    next(err);
  }
}
