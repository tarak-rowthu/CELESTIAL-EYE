import axios from 'axios';
import * as satellite from 'satellite.js';
import { Satellite } from '../models/Satellite';
import fs from 'fs';
import path from 'path';

const CELESTRAK_URL =
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle';

// Simple 5-minute in-memory cache
let cache: { data: Satellite[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches active satellite TLE data from CelesTrak and returns a list of Satellite objects.
 * Results are cached for 5 minutes. Falls back to a local TLE file if the request fails.
 */
export async function fetchActiveSatellites(): Promise<Satellite[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  let tleData = '';
  try {
    const response = await axios.get<string>(CELESTRAK_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      timeout: 6000,
    });
    tleData = response.data;
  } catch (err: any) {
    console.warn(`CelesTrak GP download failed (${err.message}). Loading local fallback active_satellites.tle`);
    try {
      const localPath = path.resolve(__dirname, '../../data/active_satellites.tle');
      tleData = fs.readFileSync(localPath, 'utf8');
    } catch (fsErr: any) {
      console.error('Failed to read local active_satellites.tle catalog:', fsErr.message);
    }
  }

  const lines = tleData.split('\n').map(l => l.trim()).filter((l) => l !== '');

  const satellites: Satellite[] = [];
  const now = new Date();
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (!name || !line1 || !line2) continue;

    try {
      const satrec = satellite.twoline2satrec(line1, line2);
      const positionAndVelocity = satellite.propagate(satrec, now);
      const posVec = positionAndVelocity.position;

      let lat = 0, lon = 0, alt = 0;
      if (posVec && typeof posVec !== 'boolean') {
        const gmst = satellite.gstime(now);
        const geo = satellite.eciToGeodetic(posVec, gmst);
        lat = satellite.degreesLat(geo.latitude);
        lon = satellite.degreesLong(geo.longitude);
        alt = geo.height; // km
      }

      const inclination = satrec.inclo * (180 / Math.PI);
      const eccentricity = satrec.ecco;
      const raan = satrec.nodeo * (180 / Math.PI);
      const meanMotion = satrec.no * (1440 / (2 * Math.PI)); // revs/day
      const orbitalPeriod = 1440 / meanMotion;

      const velVec = positionAndVelocity.velocity;
      let velocity = 0;
      if (velVec && typeof velVec !== 'boolean') {
        const vMps = Math.sqrt(velVec.x * velVec.x + velVec.y * velVec.y + velVec.z * velVec.z);
        velocity = vMps * 3600; // km/h
      }

      satellites.push({
        id: satrec.satnum.toString(),
        name,
        launchDate: 'N/A',
        orbitType: alt < 2000 ? 'Low Earth Orbit (LEO)' : alt < 35786 ? 'Medium Earth Orbit (MEO)' : 'Geostationary Orbit (GEO)',
        description: `Artificial satellite cataloged NORAD entry #${satrec.satnum}.`,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
        altitude: Number(alt.toFixed(2)),
        velocity: Number(velocity.toFixed(2)),
        inclination: Number(inclination.toFixed(4)),
        eccentricity,
        raan: Number(raan.toFixed(4)),
        meanMotion: Number(meanMotion.toFixed(6)),
        orbitalPeriod: Number(orbitalPeriod.toFixed(2)),
      });
    } catch {
      // Skip malformed TLE entries
    }
  }

  cache = { data: satellites, fetchedAt: Date.now() };
  return satellites;
}

/**
 * Return a single satellite by its NORAD catalog number (id), propagating a high-fidelity 3D orbit.
 */
export async function getSatelliteById(id: string): Promise<Satellite | null> {
  try {
    const localPath = path.resolve(__dirname, '../../data/active_satellites.tle');
    const tleData = fs.readFileSync(localPath, 'utf8');
    const lines = tleData.split('\n').map(l => l.trim()).filter((l) => l !== '');
    
    const now = new Date();
    for (let i = 0; i + 2 < lines.length; i += 3) {
      const name = lines[i];
      const line1 = lines[i + 1];
      const line2 = lines[i + 2];
      if (!name || !line1 || !line2) continue;
      
      const satrec = satellite.twoline2satrec(line1, line2);
      const satNum = satrec.satnum.toString();
      
      if (satNum === id) {
        const positionAndVelocity = satellite.propagate(satrec, now);
        const posVec = positionAndVelocity.position;
        let lat = 0, lon = 0, alt = 0;
        if (posVec && typeof posVec !== 'boolean') {
          const gmst = satellite.gstime(now);
          const geo = satellite.eciToGeodetic(posVec, gmst);
          lat = satellite.degreesLat(geo.latitude);
          lon = satellite.degreesLong(geo.longitude);
          alt = geo.height;
        }
        
        const inclination = satrec.inclo * (180 / Math.PI);
        const eccentricity = satrec.ecco;
        const raan = satrec.nodeo * (180 / Math.PI);
        const meanMotion = satrec.no * (1440 / (2 * Math.PI));
        const orbitalPeriod = 1440 / meanMotion;
        
        const velVec = positionAndVelocity.velocity;
        let velocity = 0;
        if (velVec && typeof velVec !== 'boolean') {
          const vMps = Math.sqrt(velVec.x * velVec.x + velVec.y * velVec.y + velVec.z * velVec.z);
          velocity = vMps * 3600;
        }
        
        // Propagate high-fidelity 3D orbit points (60 steps)
        const orbitPoints = [];
        const steps = 60;
        const stepMs = (orbitalPeriod * 60 * 1000) / steps;
        const nowMs = now.getTime();
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
        
        const orbitType = alt < 2000 ? 'Low Earth Orbit (LEO)' : alt < 35786 ? 'Medium Earth Orbit (MEO)' : 'Geostationary Orbit (GEO)';
        const description = `Artificial satellite cataloged NORAD entry #${satNum}. Operating in ${orbitType}.`;

        return {
          id: satNum,
          name,
          launchDate: 'N/A',
          orbitType,
          description,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lon.toFixed(6)),
          altitude: Number(alt.toFixed(2)),
          velocity: Number(velocity.toFixed(2)),
          inclination: Number(inclination.toFixed(4)),
          eccentricity,
          raan: Number(raan.toFixed(4)),
          meanMotion: Number(meanMotion.toFixed(6)),
          orbitalPeriod: Number(orbitalPeriod.toFixed(2)),
          orbitPoints,
        };
      }
    }
  } catch (err) {
    console.error('Failed to get satellite details with orbit points:', err);
  }
  
  const all = await fetchActiveSatellites();
  return all.find((s) => s.id === id) ?? null;
}

export default { fetchActiveSatellites, getSatelliteById };

