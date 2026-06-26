// frontend/lib/api.ts
import axios from 'axios';
import {
  ISSPosition,
  Satellite,
  Planet,
  Constellation,
  PredictorResult,
  LocationInfo,
  FavoriteLocation,
  FavoriteObject,
  SearchHistory,
  User,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization header
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ISS API
export async function fetchISS(): Promise<ISSPosition> {
  const response = await apiClient.get<ISSPosition>('/api/iss');
  return response.data;
}

// Satellites API
export async function fetchSatellites(): Promise<Satellite[]> {
  const response = await apiClient.get<Satellite[]>('/api/satellites');
  return response.data;
}

// Planets API
export async function fetchPlanets(lat?: number, lon?: number): Promise<Planet[]> {
  const url = lat !== undefined && lon !== undefined ? `/api/planets?lat=${lat}&lon=${lon}` : '/api/planets';
  const response = await apiClient.get<Planet[]>(url);
  return response.data;
}

// Constellations API
export async function fetchConstellations(lat: number, lon: number): Promise<Constellation[]> {
  const response = await apiClient.get<Constellation[]>(`/api/constellations?lat=${lat}&lon=${lon}`);
  return response.data;
}

// Predictor API
export async function fetchPredictor(lat: number, lon: number): Promise<PredictorResult> {
  const response = await apiClient.get<PredictorResult>(`/api/predictor?lat=${lat}&lon=${lon}`);
  return response.data;
}

// Location Info API
export async function fetchLocationInfo(lat: number, lon: number): Promise<LocationInfo> {
  const response = await apiClient.get<LocationInfo>(`/api/locations?lat=${lat}&lon=${lon}`);
  return response.data;
}

// Object API
export async function fetchObjectDetail(id: string, lat?: number, lon?: number): Promise<any> {
  const params = new URLSearchParams();
  if (lat !== undefined) params.set('lat', lat.toString());
  if (lon !== undefined) params.set('lon', lon.toString());
  const qs = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<any>(`/api/object/${id}${qs}`);
  return response.data;
}

// Auth APIs — backend returns { accessToken, refreshToken, user }
// We store accessToken as `token` in the auth store and refreshToken in localStorage.

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ token: string; refreshToken: string; user: User }> {
  const response = await apiClient.post<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>('/api/auth/register', { name, email, password });
  const { accessToken, refreshToken, user } = response.data;
  // Persist refreshToken so it survives page reload
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken);
  }
  return { token: accessToken, refreshToken, user };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; refreshToken: string; user: User }> {
  const response = await apiClient.post<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>('/api/auth/login', { email, password });
  const { accessToken, refreshToken, user } = response.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken);
  }
  return { token: accessToken, refreshToken, user };
}

export async function logoutUser(): Promise<void> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (refreshToken) {
    try {
      await apiClient.post('/api/auth/logout', { token: refreshToken });
    } catch (_) {
      // Best-effort — even if the server call fails, clear local state
    }
    localStorage.removeItem('refreshToken');
  }
}

export async function fetchProfile(): Promise<User> {
  const response = await apiClient.get<User>('/api/auth/profile');
  return response.data;
}

// Favorites - Locations
export async function fetchFavoriteLocations(): Promise<FavoriteLocation[]> {
  const response = await apiClient.get<FavoriteLocation[]>('/api/favorites/locations');
  return response.data;
}

export async function addFavoriteLocation(label: string, latitude: number, longitude: number): Promise<FavoriteLocation> {
  const response = await apiClient.post<FavoriteLocation>('/api/favorites/locations', { label, latitude, longitude });
  return response.data;
}

export async function deleteFavoriteLocation(id: string): Promise<void> {
  await apiClient.delete(`/api/favorites/locations/${id}`);
}

// Favorites - Objects
export async function fetchFavoriteObjects(): Promise<FavoriteObject[]> {
  const response = await apiClient.get<FavoriteObject[]>('/api/favorites/objects');
  return response.data;
}

export async function addFavoriteObject(objectId: string, objectType: 'SATELLITE' | 'PLANET' | 'STAR'): Promise<FavoriteObject> {
  const response = await apiClient.post<FavoriteObject>('/api/favorites/objects', { objectId, objectType });
  return response.data;
}

export async function deleteFavoriteObject(id: string): Promise<void> {
  await apiClient.delete(`/api/favorites/objects/${id}`);
}

// Search History
export async function fetchSearchHistory(): Promise<SearchHistory[]> {
  const response = await apiClient.get<SearchHistory[]>('/api/history');
  return response.data;
}

export async function addSearchHistory(query: string, latitude: number, longitude: number): Promise<SearchHistory> {
  const response = await apiClient.post<SearchHistory>('/api/history', { query, latitude, longitude });
  return response.data;
}

export async function clearSearchHistory(): Promise<void> {
  await apiClient.delete('/api/history');
}
