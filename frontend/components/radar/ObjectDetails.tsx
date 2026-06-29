// frontend/components/radar/ObjectDetails.tsx
'use client';

import React from 'react';
import { useCelestialStore, useAuthStore } from '@/store/celestialStore';
import { useObjectDetail, useFavoriteObjects, useAddFavoriteObject, useDeleteFavoriteObject } from '@/hooks/useCelestialQueries';
import { X, Star as StarIcon, Info, Sparkles, Orbit, Compass, Calendar, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ObjectDetails() {
  const { selectedObjectId, setSelectedObjectId, selectedLocation } = useCelestialStore();
  const { isAuthenticated } = useAuthStore();

  const {
    data: selectedObject,
    isLoading: selectedObjectLoading,
    error: selectedObjectError,
  } = useObjectDetail(
    selectedObjectId,
    selectedLocation?.latitude,
    selectedLocation?.longitude,
  );

  const { data: favoriteObjects = [] } = useFavoriteObjects();
  const addFavoriteMutation = useAddFavoriteObject();
  const deleteFavoriteMutation = useDeleteFavoriteObject();

  // Determine standard parameters based on object type
  const isSatellite = React.useMemo(() => {
    return selectedObject?.orbitType !== undefined || selectedObject?.latitude !== undefined;
  }, [selectedObject]);

  const isPlanet = React.useMemo(() => {
    return selectedObject?.distanceFromSunAU !== undefined;
  }, [selectedObject]);

  const isStar = React.useMemo(() => {
    return selectedObject?.ra !== undefined && !isPlanet;
  }, [selectedObject, isPlanet]);

  const objectType = React.useMemo(() => {
    if (!selectedObjectId) return 'SATELLITE';
    if (selectedObjectId.startsWith('sat_')) return 'SATELLITE';
    if (selectedObjectId.startsWith('planet_')) return 'PLANET';
    if (selectedObjectId.startsWith('star_')) return 'STAR';
    return 'SATELLITE';
  }, [selectedObjectId]);

  const isFav = React.useMemo(() => {
    if (!selectedObjectId) return false;
    return favoriteObjects.some((fav) => fav.objectId === selectedObjectId);
  }, [favoriteObjects, selectedObjectId]);

  // Satellite velocity and inclination calculation
  const satelliteMetrics = React.useMemo(() => {
    if (!isSatellite || !selectedObject) return null;
    
    const speed = selectedObject.velocity !== undefined
      ? `${selectedObject.velocity.toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h`
      : 'N/A';
    
    const inclination = selectedObject.inclination !== undefined
      ? `${selectedObject.inclination.toFixed(2)}°`
      : 'N/A';

    const eccentricity = selectedObject.eccentricity !== undefined
      ? selectedObject.eccentricity.toFixed(6)
      : 'N/A';

    const raan = selectedObject.raan !== undefined
      ? `${selectedObject.raan.toFixed(2)}°`
      : 'N/A';

    const meanMotion = selectedObject.meanMotion !== undefined
      ? `${selectedObject.meanMotion.toFixed(4)} rev/day`
      : 'N/A';

    const orbitalPeriod = selectedObject.orbitalPeriod !== undefined
      ? `${selectedObject.orbitalPeriod.toFixed(1)} min`
      : 'N/A';

    return {
      speed,
      inclination,
      eccentricity,
      raan,
      meanMotion,
      orbitalPeriod,
      orbitType: selectedObject.orbitType || 'Low Earth Orbit (LEO)',
      lastUpdated: 'Live (SGP4 propagated)',
    };
  }, [selectedObject, isSatellite]);

  // Planet rise/set and visibility calculation
  const planetMetrics = React.useMemo(() => {
    if (!isPlanet || !selectedObject) return null;
    
    const riseTime = selectedObject.riseTime || 'N/A';
    const setTime = selectedObject.setTime || 'N/A';
    const transitTime = selectedObject.transitTime || 'N/A';
    
    const mag = selectedObject.magnitude !== undefined ? selectedObject.magnitude : 5.0;
    let visibility = 'Naked Eye (Pristine)';
    let color = 'text-emerald-400';
    if (mag >= 5.5 && mag < 8.0) {
      visibility = 'Binoculars / Small Telescope';
      color = 'text-cyan-400';
    } else if (mag >= 8.0) {
      visibility = 'Large Telescope Required';
      color = 'text-amber-500';
    }

    return {
      riseTime,
      setTime,
      transitTime,
      visibility,
      color,
    };
  }, [selectedObject, isPlanet]);

  if (!selectedObjectId) return null;

  const handleClose = () => {
    setSelectedObjectId(null);
  };

  const displayName = selectedObject?.name || 'Unknown Object';
  const objectDbId = selectedObjectId;

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) return;
    if (isFav) {
      const favItem = favoriteObjects.find((fav) => fav.objectId === objectDbId);
      if (favItem) {
        deleteFavoriteMutation.mutate(favItem.id);
      }
    } else {
      addFavoriteMutation.mutate({ objectId: objectDbId, objectType });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-35 pointer-events-none">
        {/* Backdrop overlay (intercepts clicks to close) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/20 pointer-events-auto backdrop-blur-[1px]"
        />

        {/* Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-16 right-0 bottom-0 w-full sm:w-[420px] glass-panel border-l border-white/10 p-6 flex flex-col gap-6 overflow-y-auto pointer-events-auto z-40"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {objectType} Profile
            </span>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={addFavoriteMutation.isPending || deleteFavoriteMutation.isPending}
                  className={`p-2 rounded-lg hover:bg-white/5 border transition-all ${
                    isFav
                      ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5'
                      : 'border-white/5 text-zinc-400 hover:text-white'
                  }`}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <StarIcon className={`w-4.5 h-4.5 ${isFav ? 'fill-yellow-500' : ''}`} />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors border border-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          {selectedObjectLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner label="Intercepting orbital frequencies..." />
            </div>
          ) : selectedObjectError ? (
            <div className="flex-1 flex items-center justify-center p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-center flex-col gap-3">
              <ShieldAlert className="w-10 h-10 text-red-500" />
              <p className="text-sm text-zinc-400 whitespace-pre-wrap">Telemetry data is temporarily unavailable.{"\n"}Please try again later.</p>
            </div>
          ) : selectedObject ? (
            <div className="flex flex-col gap-6">
              {/* Title & Description */}
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-extrabold tracking-tight text-white">{displayName}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  {selectedObject.description || 
                   (isSatellite 
                     ? 'Active catalog communication/research satellite in geocentric orbit.' 
                     : isStar 
                     ? `Luminous stellar object located in the constellation ${selectedObject.constellation}.` 
                     : 'Solar system planetary body orbiting the Sun.')}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                {isSatellite && satelliteMetrics && (
                  <>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Orbit Class</span>
                      <span className="text-sm font-bold text-zinc-200">{satelliteMetrics.orbitType}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Launch Date</span>
                      <span className="text-sm font-bold text-zinc-200">{selectedObject.launchDate || 'N/A'}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Inclination</span>
                      <span className="text-sm font-bold text-zinc-200">{satelliteMetrics.inclination}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Eccentricity</span>
                      <span className="text-sm font-bold text-zinc-200">{satelliteMetrics.eccentricity}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">RAAN</span>
                      <span className="text-sm font-bold text-zinc-200">{satelliteMetrics.raan}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Mean Motion</span>
                      <span className="text-sm font-bold text-zinc-200 text-ellipsis overflow-hidden">{satelliteMetrics.meanMotion}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Orbital Period</span>
                      <span className="text-sm font-bold text-zinc-200">{satelliteMetrics.orbitalPeriod}</span>
                    </div>
                    {selectedObject.latitude !== undefined && (
                      <>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Live Coordinates</span>
                          <span className="text-sm font-bold font-mono text-cyan-400">
                            {selectedObject.latitude.toFixed(4)}° N, {selectedObject.longitude.toFixed(4)}° E
                          </span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Altitude</span>
                          <span className="text-sm font-bold text-zinc-200">{selectedObject.altitude ? `${selectedObject.altitude.toFixed(1)} km` : 'N/A'}</span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Velocity</span>
                          <span className="text-sm font-bold text-cyan-400 font-mono">{satelliteMetrics.speed}</span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Signal Ticker</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono animate-pulse">{satelliteMetrics.lastUpdated}</span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {isPlanet && planetMetrics && (
                  <>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Distance Sun</span>
                      <span className="text-sm font-bold text-zinc-200">{selectedObject.distanceFromSunAU} AU</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Orbital Period</span>
                      <span className="text-sm font-bold text-zinc-200">{selectedObject.orbitalPeriodDays} Days</span>
                    </div>
                    {selectedObject.alt !== undefined && selectedObject.az !== undefined && (
                      <>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Altitude</span>
                          <span className="text-sm font-bold text-cyan-400 font-mono">{selectedObject.alt.toFixed(2)}°</span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Azimuth</span>
                          <span className="text-sm font-bold text-cyan-400 font-mono">{selectedObject.az.toFixed(2)}°</span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Equatorial Coordinates (RA/Dec)</span>
                          <span className="text-sm font-bold font-mono text-zinc-200">
                            {selectedObject.ra?.toFixed(2)}° RA / {selectedObject.dec?.toFixed(2)}° Dec
                          </span>
                        </div>
                      </>
                    )}
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Rise (Local)</span>
                      <span className="text-sm font-bold text-zinc-200 font-mono">{planetMetrics.riseTime}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Set (Local)</span>
                      <span className="text-sm font-bold text-zinc-200 font-mono">{planetMetrics.setTime}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Transit Time (Local Peak)</span>
                      <span className="text-sm font-bold text-zinc-200 font-mono">{planetMetrics.transitTime}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Visual Magnitude</span>
                      <span className="text-sm font-bold text-secondary">{selectedObject.magnitude}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Observing Visibility</span>
                      <span className={`text-sm font-bold ${planetMetrics.color}`}>{planetMetrics.visibility}</span>
                    </div>
                  </>
                )}

                {isStar && (
                  <>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Magnitude</span>
                      <span className="text-sm font-bold text-yellow-500">{selectedObject.mag}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Constellation</span>
                      <span className="text-sm font-bold text-zinc-200">{selectedObject.constellation}</span>
                    </div>
                    <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-xl flex flex-col gap-1 col-span-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Equatorial Coordinates (RA/Dec)</span>
                      <span className="text-sm font-bold font-mono text-zinc-200">
                        {selectedObject.ra.toFixed(2)}° RA / {selectedObject.dec.toFixed(2)}° Dec
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Informational Alerts */}
              {!isAuthenticated && (
                <div className="flex gap-2.5 p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-400 text-xs leading-relaxed mt-2">
                  <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>
                    You must be logged in to bookmark this object to your tracking profile. Click the **Sign In** button at the top to login or register.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-center text-zinc-500 text-xs">
              Select an object to inspect its details.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
