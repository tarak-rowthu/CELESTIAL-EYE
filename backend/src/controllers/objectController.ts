// backend/src/controllers/objectController.ts
import type { Request, Response, NextFunction } from 'express';
import { getSatelliteById } from '../services/satelliteService';
import { getPlanets } from '../services/planetService';
import { loadStars } from '../services/starService';

export async function objectController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { id } = req.params;
  const { lat, lon } = req.query as Record<string, string>;

  try {
    if (id.startsWith('sat_')) {
      const satId = id.slice(4);
      const sat = await getSatelliteById(satId);
      if (!sat) { res.status(404).json({ error: 'Satellite not found' }); return; }
      res.json(sat);
      return;
    }

    if (id.startsWith('planet_')) {
      const planetId = id.slice(7);
      const latitude = lat !== undefined ? Number(lat) : undefined;
      const longitude = lon !== undefined ? Number(lon) : undefined;
      const planets = await getPlanets(latitude, longitude);
      const planet = planets.find((p) => p.id === planetId);
      if (!planet) { res.status(404).json({ error: 'Planet not found' }); return; }
      res.json(planet);
      return;
    }

    if (id.startsWith('star_')) {
      const stars = loadStars();
      const star = stars.find((s) => s.id === id.slice(5));
      if (!star) { res.status(404).json({ error: 'Star not found' }); return; }
      res.json(star);
      return;
    }

    res.status(400).json({ error: 'Invalid object id prefix. Use sat_, planet_, or star_.' });
  } catch (err) {
    next(err);
  }
}
