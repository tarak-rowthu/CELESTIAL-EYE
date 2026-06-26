// frontend/components/radar/RadarPanel.tsx
'use client';

import React, { useState } from 'react';
import { useCelestialStore } from '@/store/celestialStore';
import { useISS, useSatellites, usePlanets, useConstellations } from '@/hooks/useCelestialQueries';
import { Orbit, Compass, Eye, Search, Navigation, Star, Activity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type TabType = 'iss' | 'satellites' | 'planets' | 'constellations';

export default function RadarPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('iss');
  const [satSearch, setSatSearch] = useState('');
  
  const { selectedLocation, setSelectedObjectId } = useCelestialStore();

  const { data: iss, isLoading: issLoading } = useISS();
  const { data: satellites, isLoading: satellitesLoading } = useSatellites();
  const { data: planets, isLoading: planetsLoading } = usePlanets(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );
  const { data: constellations, isLoading: constellationsLoading } = useConstellations(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );

  const satList = satellites || [];
  const planetList = planets || [];
  const constellationList = constellations || [];

  const filteredSatellites = satList
    .filter(sat => sat.name.toLowerCase().includes(satSearch.toLowerCase()))
    .slice(0, 10);

  const tabs = [
    { id: 'iss', label: 'ISS Telemetry', icon: Activity },
    { id: 'satellites', label: 'Satellites', icon: Orbit },
    { id: 'planets', label: 'Solar Planets', icon: Compass },
    { id: 'constellations', label: 'Constellations', icon: Star },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-white/10 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Tabs Header */}
      <div className="flex border-b border-white/5 bg-zinc-950/40 p-2 overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/20 font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[480px]">
        {activeTab === 'iss' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">International Space Station</h4>
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold uppercase animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                Live tracking
              </span>
            </div>
            
            {issLoading ? (
              <div className="flex flex-col gap-3">
                <div className="h-14 w-full bg-zinc-900/60 rounded-xl animate-pulse" />
                <div className="h-14 w-full bg-zinc-900/60 rounded-xl animate-pulse" />
              </div>
            ) : iss ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950/30 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Latitude</span>
                  <span className="text-base font-bold font-mono text-white">{iss.latitude.toFixed(5)}° N</span>
                </div>
                <div className="bg-zinc-950/30 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Longitude</span>
                  <span className="text-base font-bold font-mono text-white">{iss.longitude.toFixed(5)}° E</span>
                </div>
                <div className="bg-zinc-950/30 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Altitude</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {iss.altitude !== undefined ? `${iss.altitude.toFixed(1)} km` : '~421.4 km'}
                  </span>
                </div>
                <div className="bg-zinc-950/30 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Orbital Velocity</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {iss.velocity !== undefined ? `${iss.velocity.toLocaleString()} km/h` : '~27,560 km/h'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedObjectId('sat_25544')}
                  className="col-span-2 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold rounded-xl border border-cyan-500/20 active:scale-[0.98] transition-all text-xs tracking-wider flex items-center justify-center gap-2 mt-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect Detailed Telemetry Profile</span>
                </button>
              </div>
            ) : (
              <p className="text-zinc-500 text-xs py-4 text-center">Awaiting satellite beacon feedback...</p>
            )}
          </div>
        )}

        {activeTab === 'satellites' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={satSearch}
                onChange={(e) => setSatSearch(e.target.value)}
                placeholder="Search active TLE catalog..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-950/40 rounded-xl border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-primary text-xs"
              />
            </div>

            {satellitesLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 w-full bg-zinc-900/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 font-sans">
                {filteredSatellites.map((sat) => (
                  <div
                    key={sat.id}
                    onClick={() => setSelectedObjectId(`sat_${sat.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/20 border border-white/5 hover:border-primary/20 hover:bg-zinc-900/40 cursor-pointer transition-all group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                        {sat.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        NORAD #{sat.id} | Alt: {sat.altitude ? `${sat.altitude.toFixed(0)} km` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-950/60 px-1.5 py-0.5 rounded border border-white/5">
                        Lat: {sat.latitude?.toFixed(1)}°
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
                {filteredSatellites.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-4">No matching objects in active TLE array</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'planets' && (
          <div className="flex flex-col gap-2 animate-in fade-in duration-200">
            {planetsLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 w-full bg-zinc-900/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              planetList.map((planet) => (
                <div
                  key={planet.id}
                  onClick={() => setSelectedObjectId(`planet_${planet.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/20 border border-white/5 hover:border-secondary/20 hover:bg-zinc-900/40 cursor-pointer transition-all group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white group-hover:text-secondary transition-colors">
                      {planet.name}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Dist: {planet.distanceFromSunAU} AU | Period: {planet.orbitalPeriodDays} days
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-secondary bg-secondary/5 border border-secondary/15 px-2 py-0.5 rounded">
                      Mag: {planet.magnitude}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'constellations' && (
          <div className="flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
              <h5 className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                Visible Constellations
              </h5>
              <span className="text-[10px] text-zinc-400 font-medium">
                Loc: {selectedLocation ? selectedLocation.label.split(',')[0] : 'Default'}
              </span>
            </div>

            {constellationsLoading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 w-full bg-zinc-900/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : constellationList.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {constellationList.slice(0, 16).map((c) => (
                  <div
                    key={c.abbreviation}
                    className="p-3 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-white tracking-wide">{c.name}</span>
                    <span className="text-[9px] text-zinc-500 font-semibold tracking-wider font-mono">
                      Abbr: {c.abbreviation} | Stars: {c.stars?.length || 0}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-xs text-center py-4">No visible constellations above current horizon</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
