// frontend/app/explore/page.tsx
'use client';

import React from 'react';
import Globe from '@/components/globe/Globe';
import RadarPanel from '@/components/radar/RadarPanel';
import LocationSearch from '@/components/ui/LocationSearch';
import WeatherWidget from '@/components/weather/WeatherWidget';
import ObjectDetails from '@/components/radar/ObjectDetails';
import ZenithAnalysis from '@/components/radar/ZenithAnalysis';
import { Radio } from 'lucide-react';
import { useCelestialStore } from '@/store/celestialStore';

export default function ExplorePage() {
  const { selectedLocation } = useCelestialStore();

  return (
    // items-stretch ensures the map column grows to match the sidebar height.
    // The explicit minHeight keeps the layout usable on short screens.
    <div
      className="flex flex-col lg:flex-row gap-6 relative pb-6 items-stretch"
      style={{ minHeight: 'calc(100vh - 140px)' }}
    >
      {/* ── Left sidebar controls ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <span>Scanning Geostationary Feed</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Stargazer Radar</h2>
          <p className="text-xs text-zinc-400 font-medium">
            Search coordinate feeds, toggle satellite vectors, or tap coordinates on the
            map grid to update tracking center.
          </p>
        </div>

        <LocationSearch />
        <ZenithAnalysis />
        <WeatherWidget />
        <RadarPanel />
      </div>

      {/* ── Main map viewport ─────────────────────────────────────────────── */}
      {/*
        flex-1      → takes all remaining horizontal space beside the sidebar
        overflow-hidden → hard clip — nothing renders outside this box
        position-relative → needed so Globe's absolute children stack correctly
        The minHeight is the floor; on large screens flex-1 + items-stretch
        makes it fill the full viewport height automatically.
      */}
      <div
        className="relative flex-1 overflow-hidden rounded-2xl"
        style={{ minHeight: '500px' }}
      >
        <Globe />

        {/* Floating scan-focus badge */}
        {selectedLocation && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-3.5 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-white/10 backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Scan Focus</span>
              <span className="text-xs font-bold text-white max-w-[220px] truncate">{selectedLocation.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out details drawer (portal-rendered, outside flow) */}
      <ObjectDetails />
    </div>
  );
}
