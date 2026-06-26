// frontend/app/predictor/page.tsx
'use client';

import React from 'react';
import PredictorTimeline from '@/components/predictor/PredictorTimeline';
import LocationSearch from '@/components/ui/LocationSearch';
import WeatherWidget from '@/components/weather/WeatherWidget';
import ObjectDetails from '@/components/radar/ObjectDetails';
import { Orbit, Compass, Radio } from 'lucide-react';
import { useCelestialStore } from '@/store/celestialStore';

export default function PredictorPage() {
  const { selectedLocation } = useCelestialStore();

  return (
    <div className="flex flex-col gap-8 py-4 relative">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest">
            <Orbit className="w-4 h-4 text-secondary" />
            <span>Overhead Visible Window Estimator</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Orbital Predictor</h2>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            Calculate exact visible transits for catalog satellites, space stations, planets, and constellations crossing above your sky horizon during the next 24-hour cycle.
          </p>
        </div>

        {/* Location search widget */}
        <LocationSearch />
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <WeatherWidget />

          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-zinc-400" />
              <span>Viewing Parameters</span>
            </h3>
            
            <div className="flex flex-col gap-3.5 text-xs text-zinc-400 font-medium">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Elevation Cutoff</span>
                <span className="text-white font-bold">10.0° Altitude</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Time Interval</span>
                <span className="text-white font-bold">24 Hours Forward</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Coordinates</span>
                <span className="text-white font-bold font-mono">
                  {selectedLocation ? `${selectedLocation.latitude.toFixed(3)}°, ${selectedLocation.longitude.toFixed(3)}°` : 'Default'}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Ephemeris Epoch</span>
                <span className="text-white font-bold">J2000.0 Solar System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="glass-panel border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Visible Window Chronological Log</span>
            </h3>
            <PredictorTimeline />
          </div>
        </div>
      </div>

      {/* Slide-out details drawer */}
      <ObjectDetails />
    </div>
  );
}
