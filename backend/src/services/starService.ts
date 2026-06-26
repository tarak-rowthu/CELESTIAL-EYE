// backend/src/services/starService.ts
import fs from 'fs';
import path from 'path';
import { CelestialObject } from '../models/CelestialObject';

/**
 * Interface for a star from the trimmed Hipparcos dataset.
 */
export interface Star extends CelestialObject {
  /** Right ascension in degrees */
  ra: number;
  /** Declination in degrees */
  dec: number;
  /** Apparent magnitude */
  mag: number;
  /** Constellation abbreviation (e.g., "ORI") */
  constellation: string;
}

/**
 * Interface for a constellation grouping stars.
 */
export interface Constellation {
  name: string;
  abbreviation: string;
  stars: Star[];
}

// In‑memory cache of loaded stars (≈2 MB).
let cachedStars: Star[] | null = null;

/**
 * Load the trimmed Hipparcos dataset from `backend/data/hipparcos.json`.
 * The dataset contains only stars with magnitude < 6.
 */
export function loadStars(): Star[] {
  if (cachedStars) return cachedStars;
  const filePath = path.resolve(__dirname, '../../data/hipparcos.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as any[];
  cachedStars = data.map((item) => ({
    id: item.id,
    name: item.name,
    type: 'star',
    ra: item.ra,
    dec: item.dec,
    mag: item.mag,
    constellation: item.constellation,
    description: item.description ?? '',
  } as unknown as Star));
  return cachedStars;
}

/**
 * Group stars by their constellation abbreviation.
 */
export function groupConstellations(stars: Star[]): Constellation[] {
  const map = new Map<string, Constellation>();
  stars.forEach((star) => {
    const abbrev = star.constellation;
    if (!map.has(abbrev)) {
      map.set(abbrev, { name: abbrev, abbreviation: abbrev, stars: [] });
    }
    map.get(abbrev)!.stars.push(star);
  });
  return Array.from(map.values());
}

/**
 * Convert equatorial coordinates (RA/Dec) to horizontal (altitude) for a location.
 */
function equatorialToHorizontal(
  ra: number,
  dec: number,
  lat: number,
  lon: number,
  date: Date,
): { altitude: number; azimuth: number } {
  const rad = Math.PI / 180;
  const lst = localSiderealTime(lon, date);
  const ha = ((lst - ra) * rad) % (2 * Math.PI);
  const decRad = dec * rad;
  const latRad = lat * rad;

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
  const altitude = Math.asin(sinAlt) / rad;
  const cosAz = (Math.sin(decRad) - Math.sin(altitude * rad) * Math.sin(latRad)) / (Math.cos(altitude * rad) * Math.cos(latRad));
  const azimuth = Math.acos(cosAz) / rad;
  return { altitude, azimuth };
}

/**
 * Compute Local Sidereal Time (degrees).
 */
function localSiderealTime(lon: number, date: Date): number {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const T = (JD - 2451545.0) / 36525.0;
  const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  const LST = (GMST + lon) % 360;
  return LST < 0 ? LST + 360 : LST;
}

/**
 * Return constellations that have at least one star above the horizon.
 */
export function getVisibleConstellations(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
): Constellation[] {
  const stars = loadStars();
  const visibleStars = stars.filter((star) => {
    const { altitude } = equatorialToHorizontal(star.ra, star.dec, latitude, longitude, date);
    return altitude > 0;
  });
  return groupConstellations(visibleStars);
}

export default { loadStars, getVisibleConstellations, groupConstellations };
