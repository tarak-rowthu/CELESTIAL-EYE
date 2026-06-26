// src/models/Satellite.ts
export interface Satellite {
  id: string;
  name: string;
  launchDate?: string;
  orbitType?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  velocity?: number;
  inclination?: number;
  eccentricity?: number;
  raan?: number;
  meanMotion?: number;
  orbitalPeriod?: number;
  orbitPoints?: { latitude: number; longitude: number; altitude: number }[];
}


