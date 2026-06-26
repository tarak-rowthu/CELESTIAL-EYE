// src/models/CelestialObject.ts
export interface CelestialObject {
  id: string;
  name: string;
  type: string; // e.g., star, planet, comet
  magnitude?: number;
  distanceLightYears?: number;
  discoveredAt?: string;
}
