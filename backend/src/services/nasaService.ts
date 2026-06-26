// src/services/nasaService.ts
import {
  getPlanetGeocentricEquatorial,
  equatorialToHorizontal,
  scanPlanetRisesSets,
} from '../utils/astroUtils';

/**
 * Returns basic planetary position data.
 * Computes positions dynamically using Keplerian equations.
 */
export interface PlanetInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  distanceFromSunAU: number;
  orbitalPeriodDays: number;
  magnitude: number;
  ra?: number;
  dec?: number;
  alt?: number;
  az?: number;
  riseTime?: string;
  setTime?: string;
  transitTime?: string;
  visible?: boolean;
}

const PLANETS: PlanetInfo[] = [
  { id: 'mercury', name: 'Mercury', type: 'planet', description: 'Smallest planet, closest to the Sun.', distanceFromSunAU: 0.387, orbitalPeriodDays: 88, magnitude: -0.42 },
  { id: 'venus',   name: 'Venus',   type: 'planet', description: 'Brightest natural object in the night sky after the Moon.', distanceFromSunAU: 0.723, orbitalPeriodDays: 225, magnitude: -4.4 },
  { id: 'mars',    name: 'Mars',    type: 'planet', description: 'The Red Planet.', distanceFromSunAU: 1.524, orbitalPeriodDays: 687, magnitude: -2.0 },
  { id: 'jupiter', name: 'Jupiter', type: 'planet', description: 'Largest planet in the Solar System.', distanceFromSunAU: 5.2,   orbitalPeriodDays: 4333, magnitude: -2.9 },
  { id: 'saturn',  name: 'Saturn',  type: 'planet', description: 'Ringed gas giant.', distanceFromSunAU: 9.58,  orbitalPeriodDays: 10759, magnitude: 0.7 },
  { id: 'uranus',  name: 'Uranus',  type: 'planet', description: 'Ice giant with a tilted axis.', distanceFromSunAU: 19.2,  orbitalPeriodDays: 30688, magnitude: 5.4 },
  { id: 'neptune', name: 'Neptune', type: 'planet', description: 'Farthest known planet from the Sun.', distanceFromSunAU: 30.05, orbitalPeriodDays: 60195, magnitude: 8.0 },
];

export async function getPlanetaryPositions(lat?: number, lon?: number): Promise<PlanetInfo[]> {
  const date = new Date();
  return PLANETS.map((planet) => {
    if (lat !== undefined && lon !== undefined) {
      try {
        const { ra, dec, distanceAU } = getPlanetGeocentricEquatorial(planet.id, date);
        const { alt, az } = equatorialToHorizontal(ra, dec, lat, lon, date);
        const { riseTime, setTime, transitTime } = scanPlanetRisesSets(planet.id, lat, lon, date);
        return {
          ...planet,
          distanceFromSunAU: Number(distanceAU.toFixed(4)),
          ra,
          dec,
          alt,
          az,
          riseTime,
          setTime,
          transitTime,
          visible: alt > 0,
        };
      } catch (err) {
        console.error(`Failed planet calculation for ${planet.id}:`, err);
      }
    }
    return planet;
  });
}

export default { getPlanetaryPositions };


