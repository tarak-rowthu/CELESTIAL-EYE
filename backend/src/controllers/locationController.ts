// backend/src/controllers/locationController.ts
import type { Request, Response, NextFunction } from 'express';
import { getWeather } from '../services/weatherService';
import { getTimezone } from '../utils/timezone';

/**
 * GET /api/locations?lat=<number>&lon=<number>
 *
 * Returns timezone string and current weather data for the given coordinates.
 * All code paths explicitly return so Express does not emit "headers already sent" warnings.
 */
export async function getLocationInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // req.query values are: string | ParsedQs | string[] | ParsedQs[] | undefined
  // Use typeof narrowing — never use `as` on query values.
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

  if (lat < -90 || lat > 90) {
    res.status(400).json({ error: 'lat must be between -90 and 90.' });
    return;
  }

  if (lon < -180 || lon > 180) {
    res.status(400).json({ error: 'lon must be between -180 and 180.' });
    return;
  }

  try {
    // getTimezone is synchronous — no await
    const timezone: string = getTimezone(lat, lon);
    // getWeather is async
    const weather = await getWeather(lat, lon);
    res.json({ latitude: lat, longitude: lon, timezone, weather });
  } catch (err) {
    next(err);
  }
}
