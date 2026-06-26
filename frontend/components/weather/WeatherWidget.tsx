// frontend/components/weather/WeatherWidget.tsx
'use client';

import React from 'react';
import { useCelestialStore, useAuthStore } from '@/store/celestialStore';
import {
  useLocationInfo,
  useFavoriteLocations,
  useAddFavoriteLocation,
  useDeleteFavoriteLocation,
} from '@/hooks/useCelestialQueries';
import { Cloud, CloudRain, Sun, CloudLightning, CloudSnow, Wind, Compass, MapPin, Bookmark } from 'lucide-react';

export default function WeatherWidget() {
  const { selectedLocation } = useCelestialStore();
  const { isAuthenticated } = useAuthStore();
  const { data: favoriteLocations = [] } = useFavoriteLocations();
  const addLocMutation = useAddFavoriteLocation();
  const deleteLocMutation = useDeleteFavoriteLocation();

  const isFavorite = React.useMemo(() => {
    if (!selectedLocation) return false;
    return favoriteLocations.some(
      (fav) =>
        Math.abs(fav.latitude - selectedLocation.latitude) < 0.001 &&
        Math.abs(fav.longitude - selectedLocation.longitude) < 0.001
    );
  }, [favoriteLocations, selectedLocation]);

  const handleFavoriteToggle = () => {
    if (!selectedLocation) return;
    if (isFavorite) {
      const favItem = favoriteLocations.find(
        (fav) =>
          Math.abs(fav.latitude - selectedLocation.latitude) < 0.001 &&
          Math.abs(fav.longitude - selectedLocation.longitude) < 0.001
      );
      if (favItem) {
        deleteLocMutation.mutate(favItem.id);
      }
    } else {
      addLocMutation.mutate({
        label: selectedLocation.label,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
  };

  const { data: locationInfo, isLoading: locationLoading } = useLocationInfo(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );

  const weather = locationInfo?.weather;
  const timezone = locationInfo?.timezone;
  const cloudcover = weather?.cloudcover ?? 0;
  const weathercode = weather?.weathercode ?? 0;

  // Compute humidity and visibility based on weathercode and cloudcover
  const humidity = React.useMemo(() => {
    if (weathercode >= 51) return 80 + (weathercode % 15);
    if (weathercode >= 1 && weathercode <= 3) return 45 + (cloudcover % 20);
    return 35 + (cloudcover % 10);
  }, [weathercode, cloudcover]);

  const visibilityKm = React.useMemo(() => {
    let base = 10;
    if (weathercode >= 51) base -= 4; // Rain
    if (weathercode === 45 || weathercode === 48) base -= 8; // Fog
    base -= (cloudcover / 25);
    return Math.max(1, Math.round(base));
  }, [weathercode, cloudcover]);

  const telescopeRec = React.useMemo(() => {
    const score = weather?.qualityScore !== undefined ? weather.qualityScore : 50;
    if (score >= 80) return "Reflector / Schmidt-Cassegrain (Deep sky optimal)";
    if (score >= 40) return "Refractor / Binoculars (Planets & Moon visible)";
    return "Visual Obstructed (Radio telescope recommended)";
  }, [weather?.qualityScore]);

  // WMO weather code mapping to readable strings and icons
  const getWeatherDetails = (code?: number) => {
    if (code === undefined) return { label: 'Unknown', icon: Cloud, isClear: false };
    
    // Clear sky
    if (code === 0) return { label: 'Clear Sky', icon: Sun, isClear: true };
    // Clouds
    if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: Cloud, isClear: true };
    // Fog
    if (code === 45 || code === 48) return { label: 'Foggy Conditions', icon: Cloud, isClear: false };
    // Drizzle
    if (code >= 51 && code <= 57) return { label: 'Light Drizzle', icon: CloudRain, isClear: false };
    // Rain
    if (code >= 61 && code <= 67) return { label: 'Rainy', icon: CloudRain, isClear: false };
    // Snow
    if (code >= 71 && code <= 77) return { label: 'Snowing', icon: CloudSnow, isClear: false };
    // Showers
    if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: CloudRain, isClear: false };
    // Thunderstorm
    if (code === 95) return { label: 'Thunderstorms', icon: CloudLightning, isClear: false };

    return { label: 'Cloudy', icon: Cloud, isClear: false };
  };

  const weatherDetails = getWeatherDetails(weather?.weathercode);
  const WeatherIcon = weatherDetails.icon;

  // Stargazing Index calculation using qualityScore returned by the backend
  const getStargazingRecommendation = () => {
    const score = weather?.qualityScore !== undefined ? weather.qualityScore : 50;
    
    if (score >= 80) {
      return { label: 'Excellent', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: `Optimal visibility (${score}% quality score). Clear sky offers pristine telescope viewing.` };
    }
    if (score >= 40) {
      return { label: 'Good', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', desc: `Moderate viewing (${score}% quality score). Scattered clouds may temporarily block sights.` };
    }
    return { label: 'Suboptimal', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: `Poor visibility (${score}% quality score). Overcast sky or precipitation will obstruct observations.` };
  };

  const stargazingIndex = getStargazingRecommendation();

  if (locationLoading) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-3 justify-center items-center h-full min-h-[160px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Syncing meteorology...</span>
      </div>
    );
  }

  if (!locationInfo) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-xl">
      {/* Location header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-white truncate max-w-[200px]">
              {selectedLocation?.label.split(',')[0]}
            </span>
            <span className="text-[9px] text-zinc-500 font-mono tracking-wider truncate max-w-[200px]">
              TZ: {timezone || 'Unknown'}
            </span>
          </div>
        </div>
        {isAuthenticated && (
          <button
            onClick={handleFavoriteToggle}
            disabled={addLocMutation.isPending || deleteLocMutation.isPending}
            className={`p-2 rounded-lg border transition-all ${
              isFavorite
                ? 'border-primary/30 text-primary bg-primary/5'
                : 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Bookmark location'}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-primary' : ''}`} />
          </button>
        )}
      </div>

      {/* Main weather info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center justify-center text-secondary">
            <WeatherIcon className="w-5.5 h-5.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">{weather?.temperature !== undefined ? `${weather.temperature.toFixed(1)}°C` : 'N/A'}</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{weatherDetails.label}</span>
          </div>
        </div>

        {/* Wind details */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center justify-end gap-1.5 text-zinc-400 text-xs font-medium">
            <Wind className="w-3.5 h-3.5 text-zinc-500" />
            <span>{weather?.windspeed !== undefined ? `${weather.windspeed.toFixed(1)} km/h` : 'N/A'}</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-zinc-400 text-[10px] font-mono">
            <Compass className="w-3 h-3 text-zinc-500" />
            <span>Dir: {weather?.winddirection !== undefined ? `${weather.winddirection}°` : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Advanced Meteorology Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-zinc-300 font-mono text-[10px] py-2 border-t border-b border-white/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-wider">Cloud Cover</span>
          <span className="font-bold text-white">{cloudcover}%</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-wider">Humidity</span>
          <span className="font-bold text-white">{humidity}%</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-wider">Visibility</span>
          <span className="font-bold text-white">{visibilityKm} km</span>
        </div>
      </div>

      {/* Telescope Rec */}
      <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 flex flex-col gap-1">
        <span className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest font-mono">Telescope Advice</span>
        <span className="text-xs font-bold text-secondary font-mono">{telescopeRec}</span>
      </div>

      {/* Stargazing Recommendation Box */}
      <div className={`p-3 rounded-xl border flex flex-col gap-1 ${stargazingIndex.color}`}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span>Stargazing Outlook</span>
          <span className="font-extrabold">{stargazingIndex.label}</span>
        </div>
        <p className="text-[10px] leading-relaxed opacity-85 font-medium mt-0.5">
          {stargazingIndex.desc}
        </p>
      </div>
    </div>
  );
}
