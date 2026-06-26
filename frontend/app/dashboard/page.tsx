// frontend/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useCelestialStore, useAuthStore } from '@/store/celestialStore';
import {
  useFavoriteLocations,
  useFavoriteObjects,
  useSearchHistory,
  useAddFavoriteLocation,
  useDeleteFavoriteLocation,
  useDeleteFavoriteObject,
  useClearSearchHistory,
} from '@/hooks/useCelestialQueries';
import { ShieldAlert, User, Star, MapPin, History, Trash2, Map, Calendar, Plus, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { setSelectedLocation } = useCelestialStore();

  const { data: favoriteLocations = [], isLoading: favLocationsLoading } = useFavoriteLocations();
  const { data: favoriteObjects = [], isLoading: favObjectsLoading } = useFavoriteObjects();
  const { data: searchHistory = [], isLoading: historyLoading } = useSearchHistory();

  const addLocMutation = useAddFavoriteLocation();
  const deleteLocMutation = useDeleteFavoriteLocation();
  const deleteObjMutation = useDeleteFavoriteObject();
  const clearHistoryMutation = useClearSearchHistory();

  const favoritesLoading = favLocationsLoading || favObjectsLoading;

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form states for adding favorite location
  const [newLocLabel, setNewLocLabel] = useState('');
  const [newLocLat, setNewLocLat] = useState('');
  const [newLocLon, setNewLocLon] = useState('');
  const [isAddingLoc, setIsAddingLoc] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner label="Authenticating tracking channel..." size="lg" />;
  }

  // Auth Wall
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] max-w-md mx-auto text-center gap-6 py-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/15 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Access Denied</h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            Stargazer profile feeds, search logs, and saved bookmarks are protected under secure TLS protocols. Authenticate your terminal to view metrics.
          </p>
        </div>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl active:scale-95 transition-all text-sm tracking-wider shadow-lg shadow-primary/15"
        >
          Sign In to Terminal
        </button>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newLocLat);
    const lon = parseFloat(newLocLon);
    if (!newLocLabel.trim() || isNaN(lat) || isNaN(lon)) return;

    addLocMutation.mutate({ label: newLocLabel, latitude: lat, longitude: lon });
    setNewLocLabel('');
    setNewLocLat('');
    setNewLocLon('');
    setIsAddingLoc(false);
  };

  const handleLocClick = (loc: any) => {
    setSelectedLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      label: loc.label,
    });
    router.push('/explore');
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Profile Overview Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-panel border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-black uppercase border border-primary/30">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h2>
            <span className="text-xs text-zinc-500 font-medium">Terminal Operator • {user.email}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-zinc-950/40 border border-white/5 px-4 py-2 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Saved Places</span>
            <span className="text-lg font-bold text-white mt-0.5">{favoriteLocations.length}</span>
          </div>
          <div className="bg-zinc-950/40 border border-white/5 px-4 py-2 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Bookmarks</span>
            <span className="text-lg font-bold text-secondary mt-0.5">{favoriteObjects.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Saved Coordinates */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Saved Locations */}
          <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-primary" />
                <span>Tracked Coordinate Profiles</span>
              </h3>
              <button
                onClick={() => setIsAddingLoc(!isAddingLoc)}
                className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:text-white transition-colors"
                title="Add new coordinate focus"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Location Form */}
            {isAddingLoc && (
              <form onSubmit={handleAddLocationSubmit} className="p-4 bg-zinc-950/30 border border-white/5 rounded-xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Scan Point</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Location Label"
                    value={newLocLabel}
                    onChange={(e) => setNewLocLabel(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Latitude (e.g. 40.712)"
                    value={newLocLat}
                    onChange={(e) => setNewLocLat(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Longitude (e.g. -74.006)"
                    value={newLocLon}
                    onChange={(e) => setNewLocLon(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingLoc(false)}
                    className="px-3 py-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-lg text-[10px] font-bold border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white rounded-lg text-[10px] font-bold"
                  >
                    Save Target
                  </button>
                </div>
              </form>
            )}

            {favoritesLoading ? (
              <LoadingSpinner size="sm" />
            ) : favoriteLocations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 bg-zinc-950/20 hover:bg-zinc-950/40 border border-white/5 hover:border-primary/20 rounded-xl flex items-center justify-between group transition-all"
                  >
                    <div className="flex flex-col gap-0.5 max-w-[70%]">
                      <span className="text-xs font-bold text-white truncate">{loc.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {loc.latitude.toFixed(4)}° N, {loc.longitude.toFixed(4)}° E
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLocClick(loc)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-primary/20 rounded-lg text-zinc-400 hover:text-primary transition-all"
                        title="Load on radar map"
                      >
                        <Map className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLocMutation.mutate(loc.id)}
                        className="p-2 bg-zinc-900 hover:bg-red-500/5 border border-white/5 hover:border-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                        title="Remove target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-xs py-4 text-center">No coordinate profiles bookmarked yet.</p>
            )}
          </div>

          {/* Bookmarked Objects */}
          <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <Star className="w-4.5 h-4.5 text-secondary" />
              <span>Bookmarked Space Objects</span>
            </h3>

            {favoritesLoading ? (
              <LoadingSpinner size="sm" />
            ) : favoriteObjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteObjects.map((obj) => {
                  let badgeColor = 'text-primary bg-primary/10 border-primary/20';
                  if (obj.objectType === 'PLANET') badgeColor = 'text-secondary bg-secondary/10 border-secondary/20';
                  if (obj.objectType === 'STAR') badgeColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';

                  return (
                    <div
                      key={obj.id}
                      className="p-4 bg-zinc-950/20 hover:bg-zinc-950/40 border border-white/5 hover:border-secondary/20 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <span className="text-xs font-bold text-white truncate capitalize">{obj.objectId.replace('sat_', '').replace('planet_', '').replace('star_', '')}</span>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border max-w-fit ${badgeColor}`}>
                          {obj.objectType}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteObjMutation.mutate(obj.id)}
                        className="p-2 bg-zinc-900 hover:bg-red-500/5 border border-white/5 hover:border-red-500/20 rounded-lg text-zinc-500 hover:text-red-400 transition-all"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-500 text-xs py-4 text-center">No satellites, planets, or stars bookmarked yet.</p>
            )}
          </div>
        </div>

        {/* Right Column - Search History Logs */}
        <div className="glass-panel border border-white/10 rounded-2xl p-5 flex flex-col gap-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-zinc-400" />
              <span>Search Registry Logs</span>
            </h3>
            {searchHistory.length > 0 && (
              <button
                onClick={() => clearHistoryMutation.mutate()}
                className="text-[10px] font-bold text-red-400 hover:underline flex items-center gap-1"
              >
                Clear All
              </button>
            )}
          </div>

          {historyLoading ? (
            <LoadingSpinner size="sm" />
          ) : searchHistory.length > 0 ? (
            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLocClick({ label: item.query, latitude: item.latitude, longitude: item.longitude })}
                  className="p-3 bg-zinc-950/20 hover:bg-zinc-900/40 border border-white/5 hover:border-primary/20 rounded-xl flex flex-col gap-0.5 cursor-pointer group transition-all"
                >
                  <span className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate">
                    {item.query.split(',')[0]}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono truncate">
                    {item.latitude.toFixed(3)}°, {item.longitude.toFixed(3)}°
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-xs py-4 text-center">No queries logged in search history.</p>
          )}
        </div>
      </div>
    </div>
  );
}
