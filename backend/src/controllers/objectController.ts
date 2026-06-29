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

  console.log(`[objectController] Incoming request for object id: ${id}, lat: ${lat}, lon: ${lon}`);

  try {
    if (id.startsWith('sat_')) {
      const satId = id.slice(4);
      const sat = await getSatelliteById(satId);
      if (!sat) {
        console.warn(`[objectController] Satellite ${satId} not found in database or external API.`);
        res.status(404).json({ error: 'Satellite not found' });
        return;
      }
      console.log(`[objectController] Parsed response for satellite ${satId}: ${sat.name}`);
      console.log(`[objectController] Final response sent to frontend successfully.`);
      res.json(sat);
      return;
    }

    if (id.startsWith('planet_')) {
      const planetId = id.slice(7);
      const latitude = lat !== undefined ? Number(lat) : undefined;
      const longitude = lon !== undefined ? Number(lon) : undefined;
      const planets = await getPlanets(latitude, longitude);
      const planet = planets.find((p) => p.id === planetId);
      if (!planet) {
        console.warn(`[objectController] Planet ${planetId} not found.`);
        res.status(404).json({ error: 'Planet not found' });
        return;
      }
      console.log(`[objectController] Parsed response for planet ${planetId}: ${planet.name}`);
      console.log(`[objectController] Final response sent to frontend successfully.`);
      res.json(planet);
      return;
    }

    if (id.startsWith('star_')) {
      const stars = loadStars();
      const star = stars.find((s) => s.id === id.slice(5));
      if (!star) {
        console.warn(`[objectController] Star ${id} not found in catalog.`);
        res.status(404).json({ error: 'Star not found' });
        return;
      }
      console.log(`[objectController] Parsed response for star ${id}: ${star.name}`);
      console.log(`[objectController] Final response sent to frontend successfully.`);
      res.json(star);
      return;
    }

    console.warn(`[objectController] Invalid object id prefix: ${id}`);
    res.status(400).json({ error: 'Invalid object id prefix. Use sat_, planet_, or star_.' });
  } catch (err: any) {
    console.error(`[objectController] Backend exception during telemetry retrieval for ${id}:`, err);
    // Return safe fallback error message
    res.status(500).json({ error: 'Telemetry data is temporarily unavailable.\nPlease try again later.' });
  }
}
