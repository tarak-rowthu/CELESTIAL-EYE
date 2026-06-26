// frontend/hooks/useCelestialQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchISS,
  fetchSatellites,
  fetchPlanets,
  fetchConstellations,
  fetchPredictor,
  fetchLocationInfo,
  fetchObjectDetail,
  fetchFavoriteLocations,
  addFavoriteLocation,
  deleteFavoriteLocation,
  fetchFavoriteObjects,
  addFavoriteObject,
  deleteFavoriteObject,
  fetchSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from '@/lib/api';
import { useAuthStore } from '@/store/celestialStore';

// 1. ISS Telemetry (GET /api/iss, auto-refresh 5-10s)
export function useISS() {
  return useQuery({
    queryKey: ['iss'],
    queryFn: fetchISS,
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchIntervalInBackground: true,
  });
}

// 2. Satellite Tracking (GET /api/satellites)
export function useSatellites() {
  return useQuery({
    queryKey: ['satellites'],
    queryFn: fetchSatellites,
    refetchInterval: 15000, // Refresh satellites every 15s to update positions
  });
}

// 3. Planet Tracking (GET /api/planets)
export function usePlanets(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['planets', lat, lon],
    queryFn: () => fetchPlanets(lat, lon),
  });
}

// 4. Constellations (GET /api/constellations?lat={lat}&lon={lon})
export function useConstellations(lat?: number, lon?: number) {
  const isEnabled = lat !== undefined && lon !== undefined;
  return useQuery({
    queryKey: ['constellations', lat, lon],
    queryFn: () => fetchConstellations(lat!, lon!),
    enabled: isEnabled,
  });
}

// 5. Predictor (GET /api/predictor?lat={lat}&lon={lon})
export function usePredictor(lat?: number, lon?: number) {
  const isEnabled = lat !== undefined && lon !== undefined;
  return useQuery({
    queryKey: ['predictor', lat, lon],
    queryFn: () => fetchPredictor(lat!, lon!),
    enabled: isEnabled,
  });
}

// 6. Location Information (GET /api/locations?lat={lat}&lon={lon})
export function useLocationInfo(lat?: number, lon?: number) {
  const isEnabled = lat !== undefined && lon !== undefined;
  return useQuery({
    queryKey: ['locationInfo', lat, lon],
    queryFn: () => fetchLocationInfo(lat!, lon!),
    enabled: isEnabled,
  });
}

// 7. Object Details (GET /api/object/{id})
export function useObjectDetail(id: string | null, lat?: number, lon?: number) {
  const isEnabled = !!id;
  return useQuery({
    queryKey: ['objectDetail', id, lat, lon],
    queryFn: () => fetchObjectDetail(id!, lat, lon),
    enabled: isEnabled,
  });
}

// 8. Favorite Locations
export function useFavoriteLocations() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['favoriteLocations'],
    queryFn: fetchFavoriteLocations,
    enabled: isAuthenticated,
  });
}

export function useAddFavoriteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ label, latitude, longitude }: { label: string; latitude: number; longitude: number }) =>
      addFavoriteLocation(label, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteLocations'] });
    },
  });
}

export function useDeleteFavoriteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFavoriteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteLocations'] });
    },
  });
}

// 9. Favorite Objects
export function useFavoriteObjects() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['favoriteObjects'],
    queryFn: fetchFavoriteObjects,
    enabled: isAuthenticated,
  });
}

export function useAddFavoriteObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ objectId, objectType }: { objectId: string; objectType: 'SATELLITE' | 'PLANET' | 'STAR' }) =>
      addFavoriteObject(objectId, objectType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteObjects'] });
    },
  });
}

export function useDeleteFavoriteObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFavoriteObject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteObjects'] });
    },
  });
}

// 10. Search History
export function useSearchHistory() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['searchHistory'],
    queryFn: fetchSearchHistory,
    enabled: isAuthenticated,
  });
}

export function useAddSearchHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ query, latitude, longitude }: { query: string; latitude: number; longitude: number }) =>
      addSearchHistory(query, latitude, longitude),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearSearchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });
}
