// src/services/issService.ts
import axios from 'axios';
import * as satellite from 'satellite.js';
import fs from 'fs';
import path from 'path';

const OPEN_NOTIFY_URL = 'http://api.open-notify.org/iss-now.json';
const WHERE_THE_ISS_URL = 'https://api.wheretheiss.at/v1/satellites/25544';

export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;    // km
  velocity: number;    // km/h
  timestamp: number;
  orbitPoints?: { latitude: number; longitude: number; altitude: number }[];
}

/** Load and parse the ISS TLE from local file. Returns { satrec, line1, line2 } or null. */
function loadISSTle(): { satrec: any; line1: string; line2: string } | null {
  try {
    const localPath = path.resolve(__dirname, '../../data/active_satellites.tle');
    const content = fs.readFileSync(localPath, 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');
    const idx = lines.findIndex(l => l.includes('ISS (ZARYA)'));
    if (idx !== -1 && lines[idx + 1] && lines[idx + 2]) {
      const line1 = lines[idx + 1];
      const line2 = lines[idx + 2];
      const satrec = satellite.twoline2satrec(line1, line2);
      return { satrec, line1, line2 };
    }
  } catch (err) {
    console.error('Failed to load ISS TLE:', err);
  }
  return null;
}

/** Propagate ISS orbit path for 60 steps over one full orbital period. */
function getISSOrbitPoints(): { latitude: number; longitude: number; altitude: number }[] {
  const tle = loadISSTle();
  if (!tle) return [];

  try {
    const { satrec } = tle;
    const orbitPoints: { latitude: number; longitude: number; altitude: number }[] = [];
    const steps = 60;
    const orbitalPeriodMin = (2 * Math.PI / satrec.no); // minutes
    const stepMs = (orbitalPeriodMin * 60 * 1000) / steps;
    const nowMs = Date.now();

    for (let j = 0; j <= steps; j++) {
      const t = new Date(nowMs + j * stepMs);
      const pAndV = satellite.propagate(satrec, t);
      const pVec = pAndV.position;
      if (pVec && typeof pVec !== 'boolean') {
        const gmst = satellite.gstime(t);
        const geo = satellite.eciToGeodetic(pVec, gmst);
        orbitPoints.push({
          latitude: Number(satellite.degreesLat(geo.latitude).toFixed(6)),
          longitude: Number(satellite.degreesLong(geo.longitude).toFixed(6)),
          altitude: Number(geo.height.toFixed(2)),
        });
      }
    }
    return orbitPoints;
  } catch (err) {
    console.error('Failed to propagate ISS orbit points:', err);
    return [];
  }
}

/** Propagate ISS position + altitude + velocity from local TLE for the current instant. */
function propagateISSNow(): Omit<ISSPosition, 'timestamp'> | null {
  const tle = loadISSTle();
  if (!tle) return null;

  try {
    const { satrec } = tle;
    const now = new Date();
    const pAndV = satellite.propagate(satrec, now);
    const posVec = pAndV.position;
    const velVec = pAndV.velocity;

    if (!posVec || typeof posVec === 'boolean') return null;

    const gmst = satellite.gstime(now);
    const geo = satellite.eciToGeodetic(posVec, gmst);

    const lat = satellite.degreesLat(geo.latitude);
    const lon = satellite.degreesLong(geo.longitude);
    const alt = Number(geo.height.toFixed(2));

    let vel = 0;
    if (velVec && typeof velVec !== 'boolean') {
      // ECI velocity in km/s → km/h
      const vKms = Math.sqrt(velVec.x * velVec.x + velVec.y * velVec.y + velVec.z * velVec.z);
      vel = Number((vKms * 3600).toFixed(0));
    }

    const orbitPoints = getISSOrbitPoints();
    return { latitude: lat, longitude: lon, altitude: alt, velocity: vel, orbitPoints };
  } catch (err) {
    console.error('Local ISS TLE propagation failed:', err);
    return null;
  }
}

/**
 * Fetch the current ISS location, parsing it into a clean, typed numeric coordinate object.
 * Incorporates primary Open-Notify over HTTP, secondary API fallback to wheretheiss.at,
 * and a third-tier local TLE physics propagation fallback when offline.
 */
export const getISSPosition = async (): Promise<ISSPosition> => {
  // Always pre-compute orbit path from TLE (used for all code paths)
  const localProp = propagateISSNow();
  const orbitPoints = localProp?.orbitPoints ?? [];
  const localAlt = localProp?.altitude ?? 421.4;
  const localVel = localProp?.velocity ?? 27560;

  try {
    // 1. Try Open-Notify (HTTP)
    const response = await axios.get(OPEN_NOTIFY_URL, { timeout: 3000 });
    if (response.data && response.data.iss_position) {
      return {
        latitude: parseFloat(response.data.iss_position.latitude),
        longitude: parseFloat(response.data.iss_position.longitude),
        altitude: localAlt,    // Open-Notify doesn't provide altitude; use TLE propagation
        velocity: localVel,
        timestamp: response.data.timestamp || Math.floor(Date.now() / 1000),
        orbitPoints,
      };
    }
  } catch (err: any) {
    console.warn('Open-Notify feed failed, attempting wheretheiss.at API fallback:', err.message);
  }

  try {
    // 2. Try Wheretheiss.at fallback (provides altitude and velocity)
    const response = await axios.get(WHERE_THE_ISS_URL, { timeout: 3000 });
    if (response.data && response.data.latitude !== undefined) {
      return {
        latitude: parseFloat(response.data.latitude),
        longitude: parseFloat(response.data.longitude),
        altitude: response.data.altitude ? Number(parseFloat(response.data.altitude).toFixed(2)) : localAlt,
        velocity: response.data.velocity ? Number(parseFloat(response.data.velocity).toFixed(0)) : localVel,
        timestamp: response.data.timestamp || Math.floor(Date.now() / 1000),
        orbitPoints,
      };
    }
  } catch (err: any) {
    console.warn('All ISS telemetry HTTP endpoints failed, propagating from local TLE:', err.message);
  }

  // 3. Full local TLE propagation fallback
  if (localProp) {
    return {
      ...localProp,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  // 4. Last resort static fallback
  return {
    latitude: 0,
    longitude: 0,
    altitude: 421.4,
    velocity: 27560,
    timestamp: Math.floor(Date.now() / 1000),
    orbitPoints,
  };
};

export default { getISSPosition };
