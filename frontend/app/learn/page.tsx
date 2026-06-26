// frontend/app/learn/page.tsx
'use client';

import React from 'react';
import { Orbit, Compass, GraduationCap, Activity, Info, BookOpen, Star, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearnPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  const lessons = [
    {
      title: 'Two-Line Element sets (TLE)',
      icon: Orbit,
      color: 'text-primary bg-primary/10 border-primary/20',
      description: 'A TLE is a data format encoding the list of orbital elements for an Earth-orbiting object at a specific point in time (epoch). The math package satellite.js propagates these elements to estimate latitude, longitude, altitude, and orbital velocity in real time.',
    },
    {
      title: 'Tracking the ISS',
      icon: Activity,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: 'The International Space Station orbits at an altitude of approximately 420 kilometers, moving at a speed of 27,600 km/h (7.6 km/s). It completes an orbit around the Earth every 93 minutes. It is easily visible to the naked eye under clear skies as a bright star moving steadily from west to east.',
    },
    {
      title: 'Equatorial Coordinates (RA & Dec)',
      icon: Compass,
      color: 'text-secondary bg-secondary/10 border-secondary/20',
      description: 'Right Ascension (RA) and Declination (Dec) are the celestial equivalents of longitude and latitude on Earth. RA is measured in hours/minutes eastward from the vernal equinox, while Dec is measured in degrees north (+) or south (-) of the celestial equator.',
    },
    {
      title: 'Azimuth and Altitude',
      icon: Star,
      color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      description: 'Altitude is the angle of an object above the observer\'s local horizon (from 0° at the horizon to 90° at the zenith). Azimuth is the direction along the horizon (from 0° North, 90° East, 180° South, 270° West) defining where to look.',
    },
  ];

  return (
    <div className="flex flex-col gap-10 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span>Astro-Telemetry Academy</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Stargazer Education Guild</h2>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
          Learn the foundational mechanics of geocentric satellite tracking, astronomical propagation, and stellar coordinate mapping models.
        </p>
      </div>

      {/* Guide Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {lessons.map((lesson, idx) => {
          const Icon = lesson.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${lesson.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">{lesson.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                {lesson.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stargazing tips box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="p-5 rounded-2xl glass-panel border border-white/10 flex gap-4 mt-4"
      >
        <BookOpen className="w-8 h-8 text-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5 text-xs text-zinc-400 leading-relaxed font-medium">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider">Observer Tip: Stargazing Conditions</h4>
          <p>
            Stargazing is highly dependent on light pollution and meteorological cloud cover. Always check the **Stargazing Outlook** on the **Explore** page or **Predictor** tab. For best viewing, locate a spot away from streetlights (low Bortle class index) and allow 20 minutes for your eyes to adapt to the dark.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
