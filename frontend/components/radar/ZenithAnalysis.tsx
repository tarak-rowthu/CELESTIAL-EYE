// frontend/components/radar/ZenithAnalysis.tsx
'use client';

import React, { useMemo } from 'react';
import { useCelestialStore } from '@/store/celestialStore';
import { useISS, useSatellites, usePlanets, useConstellations, useLocationInfo } from '@/hooks/useCelestialQueries';
import { Sparkles, Eye, Shield, Activity, Clock, Compass } from 'lucide-react';

// Helper to calculate angular distance between two lat/lon coordinates in radians
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c;
}

export default function ZenithAnalysis() {
  const { selectedLocation, setSelectedObjectId } = useCelestialStore();

  const { data: iss } = useISS();
  const { data: satellites } = useSatellites();
  const { data: planets } = usePlanets(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );
  const { data: constellations } = useConstellations(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );
  const { data: locationInfo } = useLocationInfo(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );

  // 1. Calculate Observation Quality score
  const qualityScore = useMemo(() => {
    if (locationInfo?.weather?.qualityScore !== undefined) {
      return locationInfo.weather.qualityScore;
    }
    return 50; // default fallback
  }, [locationInfo]);

  // 2. Identify all visible objects and select the one closest to the observer's zenith
  const zenithAnalysis = useMemo(() => {
    if (!selectedLocation) return null;

    const latObs = selectedLocation.latitude;
    const lonObs = selectedLocation.longitude;
    const candidates: { id: string; name: string; type: string; distance: number; details: string }[] = [];

    // Check ISS
    if (iss && iss.latitude !== undefined && iss.longitude !== undefined) {
      const dist = getDistance(iss.latitude, iss.longitude, latObs, lonObs);
      candidates.push({
        id: 'sat_25544',
        name: 'ISS (ZARYA)',
        type: 'Space Station',
        distance: dist,
        details: `Alt: ~421km | Lat: ${iss.latitude.toFixed(2)}°`,
      });
    }

    // Check Satellites
    if (satellites && Array.isArray(satellites)) {
      satellites.forEach((sat) => {
        if (sat.latitude !== undefined && sat.longitude !== undefined) {
          const dist = getDistance(sat.latitude, sat.longitude, latObs, lonObs);
          candidates.push({
            id: `sat_${sat.id}`,
            name: sat.name,
            type: 'Satellite',
            distance: dist,
            details: `Alt: ${(sat.altitude || 500).toFixed(0)}km | NORAD #${sat.id}`,
          });
        }
      });
    }

    // Check Planets (compute positions using real astronomical coordinates)
    if (planets && Array.isArray(planets)) {
      planets.forEach((planet) => {
        let dist = 999;
        if (planet.alt !== undefined) {
          dist = ((90 - planet.alt) * Math.PI) / 180;
        }

        candidates.push({
          id: `planet_${planet.id}`,
          name: planet.name,
          type: 'Planet',
          distance: dist,
          details: planet.alt !== undefined && planet.az !== undefined
            ? `Alt: ${planet.alt.toFixed(1)}° | Az: ${planet.az.toFixed(1)}°`
            : `Dist: ${planet.distanceFromSunAU} AU | Mag: ${planet.magnitude}`,
        });
      });
    }

    // Filter candidate list for "overhead" (within 1.2 radians, or roughly 70 deg cone)
    const visibleCandidates = candidates.filter((c) => c.distance < 1.2);

    // Sort by distance (ascending) to find the absolute closest to the observer's zenith
    candidates.sort((a, b) => a.distance - b.distance);
    const closest = candidates[0] || null;

    return {
      closest,
      totalVisibleSats: visibleCandidates.filter((c) => c.type === 'Satellite' || c.type === 'Space Station').length,
      visiblePlanets: visibleCandidates.filter((c) => c.type === 'Planet').map((c) => c.name),
    };
  }, [selectedLocation, iss, satellites, planets]);

  // Determine viewing window quality details
  const viewWindow = useMemo(() => {
    if (qualityScore >= 75) {
      return {
        time: '21:00 - 03:30 Local Time',
        status: 'Optimal Window',
        color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        desc: 'Pristine atmospheric conditions. High-magnification planetary observation highly recommended.',
      };
    } else if (qualityScore >= 40) {
      return {
        time: '22:15 - 01:45 Local Time',
        status: 'Moderate Window',
        color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
        desc: 'Intermittent clouds. Best for tracking fast-moving satellites and bright constellations.',
      };
    } else {
      return {
        time: 'No Optimal Viewing Window',
        status: 'Suboptimal Conditions',
        color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
        desc: 'Overcast skies or heavy cloud cover. Live telescope imaging offline.',
      };
    }
  }, [qualityScore]);

  if (!selectedLocation) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-center text-center">
        <p className="text-zinc-500 text-xs">
          Select or search an observer location to view Zenith Stargazing Analysis.
        </p>
      </div>
    );
  }

  // Circular gauge settings
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (qualityScore / 100) * circumference;

  const scoreColor = qualityScore >= 75 ? '#34d399' : qualityScore >= 40 ? '#22d3ee' : '#f87171';

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-5 shadow-xl bg-zinc-950/40 backdrop-blur-md relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider font-mono">
            Zenith Analysis System
          </span>
        </div>
        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
          Sector-G
        </span>
      </div>

      {/* Main Grid: Meter & Stats */}
      <div className="grid grid-cols-5 gap-4 items-center">
        {/* Quality Progress SVG */}
        <div className="col-span-2 flex flex-col items-center justify-center relative">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={scoreColor}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-white font-mono leading-none">{qualityScore}%</span>
              <span className="text-[7px] text-zinc-500 font-extrabold uppercase tracking-widest mt-0.5">Quality</span>
            </div>
          </div>
        </div>

        {/* Visibility Details Counts */}
        <div className="col-span-3 flex flex-col gap-2 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Overhead Satellites</span>
            <span className="font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px]">
              {zenithAnalysis?.totalVisibleSats ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Visible Planets</span>
            <span className="font-bold text-secondary bg-secondary/5 border border-secondary/15 px-2 py-0.5 rounded text-[11px]">
              {zenithAnalysis?.visiblePlanets?.length ?? 0}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">Constellations</span>
            <span className="font-bold text-yellow-400 bg-yellow-400/5 border border-yellow-400/15 px-2 py-0.5 rounded text-[11px]">
              {constellations?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Closest overhead object widget */}
      {zenithAnalysis?.closest && (
        <div
          onClick={() => setSelectedObjectId(zenithAnalysis.closest!.id)}
          className="p-3 bg-zinc-950/50 border border-white/5 hover:border-primary/20 hover:bg-zinc-900/40 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-1 py-0.2 rounded font-extrabold uppercase font-mono tracking-wider">
                Closest Overhead Target
              </span>
            </div>
            <span className="text-xs font-bold text-white group-hover:text-primary transition-colors mt-1 font-mono">
              {zenithAnalysis.closest.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {zenithAnalysis.closest.details}
            </span>
          </div>
          <Eye className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
        </div>
      )}

      {/* Forecast Window */}
      <div className={`p-3 rounded-xl border flex flex-col gap-1.5 ${viewWindow.color}`}>
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider font-mono">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Observation Window
          </span>
          <span>{viewWindow.status}</span>
        </div>
        <div className="text-xs font-bold font-mono tracking-wide">{viewWindow.time}</div>
        <p className="text-[10px] leading-relaxed opacity-80 font-medium">
          {viewWindow.desc}
        </p>
      </div>
    </div>
  );
}
