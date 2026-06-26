// frontend/components/predictor/PredictorTimeline.tsx
'use client';

import React from 'react';
import { useCelestialStore } from '@/store/celestialStore';
import { usePredictor } from '@/hooks/useCelestialQueries';
import { Activity, Orbit, Compass, Star, Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function PredictorTimeline() {
  const { selectedLocation, setSelectedObjectId } = useCelestialStore();

  const {
    data: predictor,
    isLoading: predictorLoading,
    error: predictorError,
  } = usePredictor(selectedLocation?.latitude, selectedLocation?.longitude);

  if (predictorLoading) {
    return <LoadingSpinner label="Running ephemeris algorithms & projecting orbits..." size="lg" />;
  }

  if (predictorError) {
    return (
      <div className="p-6 text-center text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl max-w-md mx-auto my-6">
        <p>Failed to load predictor forecast feed.</p>
      </div>
    );
  }

  if (!predictor || !predictor.events || predictor.events.length === 0) {
    return (
      <div className="p-8 text-center glass-panel rounded-xl text-zinc-500 text-sm max-w-md mx-auto my-6">
        <p>No upcoming overhead visible transits recorded for this coordinate center.</p>
      </div>
    );
  }

  // Helper to format Unix timestamp
  const formatEventTime = (unixSecs: number) => {
    const date = new Date(unixSecs * 1000);
    const now = new Date();
    
    let dayPrefix = '';
    if (date.toDateString() === now.toDateString()) {
      dayPrefix = 'Today';
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) {
        dayPrefix = 'Tomorrow';
      } else {
        dayPrefix = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      }
    }

    const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${dayPrefix} at ${timeStr}`;
  };

  // Helper to get visual theme properties for each event type
  const getEventTheme = (type: string) => {
    switch (type) {
      case 'ISS_PASS':
        return {
          color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
          glow: 'glow-secondary',
          icon: Activity,
          badge: 'ISS Overpass',
        };
      case 'SATELLITE_PASS':
        return {
          color: 'text-secondary border-secondary/20 bg-secondary/5',
          glow: 'glow-secondary',
          icon: Orbit,
          badge: 'Satellite Transit',
        };
      case 'PLANET_VISIBILITY':
        return {
          color: 'text-primary border-primary/20 bg-primary/5',
          glow: 'glow-primary',
          icon: Compass,
          badge: 'Planet Visible',
        };
      case 'CONSTELLATION':
      default:
        return {
          color: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
          glow: 'shadow-lg shadow-yellow-500/5',
          icon: Star,
          badge: 'Constellation Rise',
        };
    }
  };

  const handleEventClick = (event: any) => {
    if (event.type === 'ISS_PASS') {
      setSelectedObjectId('sat_25544');
    } else if (event.type === 'SATELLITE_PASS' && event.satelliteId) {
      setSelectedObjectId(`sat_${event.satelliteId}`);
    } else if (event.type === 'PLANET_VISIBILITY' && event.name) {
      setSelectedObjectId(`planet_${event.name.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative max-w-2xl mx-auto py-4">
      {/* Centered Timeline line */}
      <div className="absolute left-[23px] sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-secondary/20 to-transparent" />

      {predictor.events.map((event, index) => {
        const theme = getEventTheme(event.type);
        const Icon = theme.icon;
        const formattedTime = formatEventTime(event.timestamp);
        
        // Alternating sides for desktop
        const isLeft = index % 2 === 0;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            onClick={() => handleEventClick(event)}
            className={`flex flex-col sm:flex-row items-start sm:items-center relative w-full cursor-pointer group ${
              isLeft ? 'sm:flex-row-reverse' : ''
            }`}
          >
            {/* Date Indicator Side */}
            <div className={`hidden sm:flex w-1/2 justify-end px-8 ${isLeft ? 'justify-start' : 'justify-end'}`}>
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
              </div>
            </div>

            {/* Timeline Dot */}
            <div className="absolute left-1.5 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-primary transition-all z-10">
              <Icon className="w-4.5 h-4.5" />
            </div>

            {/* Event Card Side */}
            <div className="w-full sm:w-1/2 pl-12 pr-4 sm:px-8">
              <div className={`p-4 rounded-2xl glass-panel border border-white/5 group-hover:border-white/10 glass-panel-hover flex flex-col gap-2 relative overflow-hidden`}>
                {/* Mobile time display */}
                <div className="flex sm:hidden items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Clock className="w-3 h-3" />
                  <span>{formattedTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${theme.color}`}>
                    {theme.badge}
                  </span>
                  {event.name && (
                    <span className="text-xs font-black text-white">{event.name}</span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-semibold mt-1">
                  {event.description}
                </p>

                {event.type !== 'CONSTELLATION' && (
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-primary transition-colors flex items-center gap-1">
                      Inspect Telemetry
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
