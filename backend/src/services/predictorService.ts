// backend/src/services/predictorService.ts
import { Request, Response } from 'express';
import * as satellite from 'satellite.js';
import fs from 'fs';
import path from 'path';
import { getPlanetaryPositions } from './nasaService';
import { getVisibleConstellations } from './starService';
import {
  getPlanetGeocentricEquatorial,
  equatorialToHorizontal,
  scanPlanetRisesSets
} from '../utils/astroUtils';

export interface CelestialEvent {
  type: string;
  timestamp: number;
  name?: string;
  description: string;
  satelliteId?: string;
  maxElevation?: number;
  duration?: number;
}

interface SatellitePass {
  satelliteId: string;
  name: string;
  riseTime: Date;
  setTime: Date;
  maxElevationTime: Date;
  maxElevation: number;
  duration: number; // seconds
}

function calculateSatellitePasses(
  name: string,
  id: string,
  line1: string,
  line2: string,
  observerLat: number,
  observerLon: number,
  startDate: Date
): SatellitePass[] {
  try {
    const satrec = satellite.twoline2satrec(line1, line2);
    const observerGeodetic = {
      latitude: observerLat * (Math.PI / 180),
      longitude: observerLon * (Math.PI / 180),
      height: 0.1 // 100 meters
    };

    const passes: SatellitePass[] = [];
    const totalMinutes = 1440; // 24 hours
    const stepMs = 60 * 1000;
    const startMs = startDate.getTime();

    let inPass = false;
    let passRiseTime: Date | null = null;
    let passMaxElev = -999;
    let passMaxElevTime: Date | null = null;

    for (let m = 0; m <= totalMinutes; m += 2) { // 2 minute steps for efficiency
      const t = new Date(startMs + m * stepMs);
      const pAndV = satellite.propagate(satrec, t);
      const pos = pAndV.position;

      if (pos && typeof pos !== 'boolean') {
        const gmst = satellite.gstime(t);
        const posEcf = satellite.eciToEcf(pos, gmst);
        const look = satellite.ecfToLookAngles(observerGeodetic, posEcf);
        const elevation = look.elevation * (180 / Math.PI);

        if (elevation >= 10) {
          if (!inPass) {
            inPass = true;
            passRiseTime = t;
            passMaxElev = elevation;
            passMaxElevTime = t;
          } else {
            if (elevation > passMaxElev) {
              passMaxElev = elevation;
              passMaxElevTime = t;
            }
          }
        } else {
          if (inPass && passRiseTime && passMaxElevTime) {
            inPass = false;
            const passSetTime = t;
            const duration = Math.floor((passSetTime.getTime() - passRiseTime.getTime()) / 1000);
            passes.push({
              satelliteId: id,
              name,
              riseTime: passRiseTime,
              setTime: passSetTime,
              maxElevationTime: passMaxElevTime,
              maxElevation: Number(passMaxElev.toFixed(1)),
              duration,
            });
          }
        }
      }
    }

    if (inPass && passRiseTime && passMaxElevTime) {
      const passSetTime = new Date(startMs + totalMinutes * stepMs);
      const duration = Math.floor((passSetTime.getTime() - passRiseTime.getTime()) / 1000);
      passes.push({
        satelliteId: id,
        name,
        riseTime: passRiseTime,
        setTime: passSetTime,
        maxElevationTime: passMaxElevTime,
        maxElevation: Number(passMaxElev.toFixed(1)),
        duration,
      });
    }

    return passes;
  } catch (err) {
    console.error(`SGP4 pass calculation error for satellite ${name}:`, err);
    return [];
  }
}

export async function predictNext24h(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
): Promise<CelestialEvent[]> {
  const events: CelestialEvent[] = [];
  const now = date.getTime();

  // 1. Calculate Satellite passes using local TLE dataset (including ISS)
  try {
    const localPath = path.resolve(__dirname, '../../data/active_satellites.tle');
    const content = fs.readFileSync(localPath, 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    for (let i = 0; i + 2 < lines.length; i += 3) {
      const name = lines[i];
      const line1 = lines[i + 1];
      const line2 = lines[i + 2];
      
      const isISS = name.includes('ISS (ZARYA)');
      const satId = isISS ? '25544' : (line1.split(/\s+/)[1] || `sat_${i}`);

      const satPasses = calculateSatellitePasses(name, satId, line1, line2, latitude, longitude, date);
      satPasses.forEach((pass) => {
        events.push({
          type: isISS ? 'ISS_PASS' : 'SATELLITE_PASS',
          satelliteId: pass.satelliteId,
          name: pass.name,
          timestamp: Math.floor(pass.maxElevationTime.getTime() / 1000),
          description: `${isISS ? 'ISS' : `Satellite ${pass.name}`} transit overhead. Max Elevation: ${pass.maxElevation}°, Duration: ${Math.floor(pass.duration / 60)}m`,
          maxElevation: pass.maxElevation,
          duration: pass.duration,
        });
      });
    }
  } catch (err: any) {
    console.error('Failed to compute SGP4 satellite passes:', err.message);
  }

  // 2. Calculate true Planet Transits and Visibility
  try {
    const planets = await getPlanetaryPositions(latitude, longitude);
    planets.forEach((planet) => {
      if (planet.alt !== undefined && planet.transitTime && planet.transitTime !== 'N/A') {
        const [timePart, modifier] = planet.transitTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const transitDate = new Date(date);
        transitDate.setHours(hours, minutes, 0, 0);

        events.push({
          type: 'PLANET_VISIBILITY',
          name: planet.name,
          timestamp: Math.floor(transitDate.getTime() / 1000),
          description: `${planet.name} crosses the meridian tonight at altitude ${planet.alt.toFixed(1)}° (${planet.magnitude} mag)`,
        });
      }
    });
  } catch (err) {
    console.error('Failed to compute planetary predictor transits:', err);
  }

  // 3. Compute Constellation visibility events
  try {
    const constellations = getVisibleConstellations(latitude, longitude, date);
    constellations.slice(0, 5).forEach((c, idx) => {
      // Offset constellation events across the evening
      const eventTime = now + (idx + 1) * 3600 * 1000;
      events.push({
        type: 'CONSTELLATION',
        name: c.name,
        timestamp: Math.floor(eventTime / 1000),
        description: `Constellation ${c.name} rises above the horizon with ${c.stars.length} stars visible`,
      });
    });
  } catch (err) {
    console.error('Failed to compute constellation predictor transits:', err);
  }

  // Sort chronologically
  events.sort((a, b) => a.timestamp - b.timestamp);
  return events;
}

export async function predictorController(req: Request, res: Response): Promise<void> {
  const { lat, lon } = req.query as Record<string, string>;
  if (!lat || !lon) {
    res.status(400).json({ error: 'lat and lon query params are required' });
    return;
  }
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    res.status(400).json({ error: 'Invalid latitude or longitude' });
    return;
  }
  try {
    const events = await predictNext24h(latitude, longitude);
    res.json({ events });
  } catch (e) {
    console.error('Predictor error:', e);
    res.status(500).json({ error: 'Failed to compute predictions' });
  }
}

