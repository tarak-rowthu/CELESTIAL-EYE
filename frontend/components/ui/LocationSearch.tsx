// frontend/components/ui/LocationSearch.tsx
'use client';

import React, { useState } from 'react';
import { useCelestialStore, useAuthStore } from '@/store/celestialStore';
import { useAddSearchHistory } from '@/hooks/useCelestialQueries';
import { Search, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { setSelectedLocation } = useCelestialStore();
  const { isAuthenticated } = useAuthStore();
  const addSearchHistoryMutation = useAddSearchHistory();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowDropdown(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      setResults(response.data);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const label = item.display_name;

    setSelectedLocation({ latitude: lat, longitude: lon, label });
    setShowDropdown(false);
    setQuery('');

    // If authenticated, push to database search history
    if (isAuthenticated) {
      addSearchHistoryMutation.mutate({ query: label, latitude: lat, longitude: lon });
    }
  };

  return (
    <div className="relative w-full max-w-md z-30">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search celestial scan location..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-950/40 rounded-xl border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-primary text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-5 bg-zinc-900 border border-white/10 hover:border-primary/20 hover:bg-zinc-800/80 hover:text-primary rounded-xl transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {showDropdown && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel border border-white/10 rounded-xl overflow-hidden shadow-2xl z-40 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center text-zinc-500 text-xs gap-2 items-center">
              <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
              <span>Scanning coordinate databases...</span>
            </div>
          ) : (
            <div className="flex flex-col">
              {results.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3.5 hover:bg-white/5 flex items-start gap-3 border-b border-white/5 last:border-b-0 group"
                >
                  <MapPin className="w-4.5 h-4.5 text-zinc-500 group-hover:text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                      {item.display_name.split(',')[0]}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[340px]">
                      {item.display_name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
