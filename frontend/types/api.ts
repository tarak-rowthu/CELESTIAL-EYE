// frontend/types/api.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

export interface Star {
  id: string;
  name: string;
  type: 'star';
  ra: number;
  dec: number;
  mag: number;
  constellation: string;
  description?: string;
}

export interface Constellation {
  name: string;
  abbreviation: string;
  stars: Star[];
}

export interface Planet {
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

export interface WeatherInfo {
  temperature?: number;
  weathercode?: number;
  windspeed?: number;
  winddirection?: number;
  time?: string;
  cloudcover?: number;
  qualityScore?: number;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  timezone: string;
  weather: WeatherInfo;
}

export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;     // km
  velocity: number;     // km/h
  timestamp: number;
  orbitPoints?: { latitude: number; longitude: number; altitude: number }[];
}

export interface CelestialEvent {
  type: string;
  timestamp: number;
  name?: string;
  description: string;
  satelliteId?: string;
  maxElevation?: number;
  duration?: number;
}

export interface PredictorResult {
  events: CelestialEvent[];
}

export interface FavoriteLocation {
  id: string;
  userId: string;
  label: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface FavoriteObject {
  id: string;
  userId: string;
  objectId: string;
  objectType: 'SATELLITE' | 'PLANET' | 'STAR';
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  latitude: number;
  longitude: number;
  searchedAt: string;
}
