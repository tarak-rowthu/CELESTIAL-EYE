// frontend/app/about/page.tsx
'use client';

import React from 'react';
import { Info, Cpu, Database, Eye, Code, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const techStack = [
    { category: 'Frontend Shell', items: ['Next.js 15 (App Router)', 'React 19', 'Zustand Store', 'Framer Motion API'] },
    { category: 'Data Visuals', items: ['Leaflet Maps Client', 'Recharts Core', 'Lucide Vector Library', 'Tailwind CSS'] },
    { category: 'Backend Engine', items: ['Express Framework', 'TypeScript compiler', 'Prisma Schema Client', 'PostgreSQL DB'] },
    { category: 'Physics & Tools', items: ['satellite.js (TLE prop)', 'tz-lookup (IANA maps)', 'Axios Core client', 'Helmet Security'] },
  ];

  const apis = [
    { name: 'CelesTrak NORAD TLE', url: 'https://celestrak.org', desc: 'Provides Two-Line Element sets for active satellites propagated live via satellite.js SGP4 orbital mechanics.' },
    { name: 'Open-Meteo Weather API', url: 'https://open-meteo.com', desc: 'Delivers real-time cloud cover, temperature, and wind data used to calculate local stargazing visibility indexes.' },
    { name: 'Nominatim Geocoding API', url: 'https://nominatim.org', desc: 'Allows users to search and resolve text locations into latitude and longitude coordinate arrays instantly.' },
    { name: 'Open-Notify ISS API', url: 'http://open-notify.org', desc: 'Supplies real-time orbital coordinate streams representing the International Space Station (ZARYA).' },
  ];

  return (
    <div className="flex flex-col gap-10 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest">
          <Info className="w-5 h-5 text-secondary" />
          <span>System Specifications</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">About PROJECT ZENITH</h2>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
          Technical specifications, dependency stacks, and open data API systems powering the real-time celestial tracker.
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4.5 h-4.5 text-zinc-500" />
          <span>Core Development Stack</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {techStack.map((tech, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2.5">
              <span className="text-[10px] text-primary font-black uppercase tracking-wider">{tech.category}</span>
              <ul className="flex flex-col gap-1.5">
                {tech.items.map((item, subIdx) => (
                  <li key={subIdx} className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-zinc-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Open APIs Section */}
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4.5 h-4.5 text-zinc-500" />
          <span>Telemetry Feeds & Open APIs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apis.map((api, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white tracking-wide">{api.name}</h4>
                <a
                  href={api.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-secondary p-1 rounded hover:bg-white/5 transition-colors"
                  title={`Visit ${api.name}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                {api.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
