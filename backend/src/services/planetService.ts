// backend/src/services/planetService.ts
// Re-exports from nasaService for convenience. All planet data is in nasaService.ts.
export { getPlanetaryPositions as getPlanets, PlanetInfo as Planet } from './nasaService';
