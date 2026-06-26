// frontend/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useISS, useSatellites, usePlanets } from '@/hooks/useCelestialQueries';
import { Compass, Orbit, CloudRain, Star, ShieldAlert, ArrowRight, Activity, Calendar, Compass as GlobeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { data: iss } = useISS();
  const { data: satellites } = useSatellites();
  const { data: planets } = usePlanets();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="flex flex-col gap-16 py-8 relative">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mx-auto flex flex-col gap-6 items-center mt-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold tracking-wider text-primary uppercase animate-pulse">
          <Activity className="w-3.5 h-3.5" />
          <span>Live Celestial Feed Active</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
          Track the Heavens in Real Time
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed">
          A high-fidelity cosmic radar and predictive scanner tracking active orbital satellites, constellations, and planets from your exact location.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Compass className="w-5 h-5 animate-spin-slow" />
            <span>Launch Stargazer Radar</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            href="/predictor"
            className="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 text-zinc-200 hover:text-white font-bold rounded-xl active:scale-95 transition-all"
          >
            <Calendar className="w-5 h-5" />
            <span>Check Visible Windows</span>
          </Link>
        </div>
      </motion.div>

      {/* Real-time Telemetry Status Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Stat 1 */}
        <div className="flex flex-col items-center text-center gap-2 border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">ISS Position</span>
          {iss ? (
            <div className="flex flex-col">
              <span className="text-xl font-bold font-mono text-secondary">
                {iss.latitude.toFixed(4)}°, {iss.longitude.toFixed(4)}°
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest mt-1 animate-pulse">
                ● Telemetry Live
              </span>
            </div>
          ) : (
            <span className="text-zinc-400 text-sm animate-pulse">Querying Telemetry Feed...</span>
          )}
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col items-center text-center gap-2 border-b sm:border-b-0 sm:border-r border-white/5 pb-4 sm:pb-0">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Active Satellites</span>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-mono text-primary">
              {satellites && satellites.length > 0 ? satellites.length : 'Loading TLE...'}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest mt-1">
              CelesTrak Active Catalog
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Planetary Systems</span>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-mono text-white">
              {planets && planets.length > 0 ? planets.length : '7 Core'}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest mt-1">
              NASA Horizons Ephemeris
            </span>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
      >
        {/* Card 1 */}
        <motion.div
          variants={itemVariants}
          className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-primary">
            <GlobeIcon className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">Interactive 3D Radar</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Render satellites and planetary bodies dynamically. Toggle overlays for stars, constellation meshes, and active space debris.
          </p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          variants={itemVariants}
          className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary glow-secondary">
            <Orbit className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Orbital Predictor</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Calculate accurate stargazing windows for the next 24 hours. Get alerted on visible overhead passes of the ISS and top catalog satellites.
          </p>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          variants={itemVariants}
          className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-zinc-100/10 border border-zinc-100/20 flex items-center justify-center text-zinc-100">
            <CloudRain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Weather Integration</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Astronomy relies on clear skies. View current temperature, cloud cover, and general stargazing index before packing your telescope.
          </p>
        </motion.div>
      </motion.div>

      {/* Decorative Rotating Orbit Graphic */}
      <div className="absolute top-[20%] left-[-15%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
