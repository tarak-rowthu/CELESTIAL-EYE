// frontend/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import AppInitializer from '@/components/layout/AppInitializer';

import Providers from '@/components/layout/Providers';

export const metadata: Metadata = {
  title: 'Celestial Eye - Real-Time Cosmic Radar & Space Predictor',
  description:
    'Track the ISS and active satellites, scan visible stars and constellations above your horizon, check current weather conditions, and get accurate astronomical predictions.',
  keywords: ['satellite tracker', 'ISS tracker', 'constellation map', 'stargazing predictor', 'astronomy', 'space radar'],
  authors: [{ name: 'Celestial Eye Team' }],
  openGraph: {
    title: 'Celestial Eye - Real-Time Cosmic Radar',
    description: 'Track the ISS, satellites, stars, and planets in real-time with localized stargazing predictions.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* CesiumJS CDN */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/cesium@1.118.0/Build/Cesium/Widgets/widgets.css"
        />
        <script src="https://unpkg.com/cesium@1.118.0/Build/Cesium/Cesium.js"></script>
      </head>
      <body className="antialiased min-h-screen text-zinc-100 selection:bg-primary/30 selection:text-white relative">
        {/* Rotating star backdrop */}
        <div className="stars-bg" />
        
        <Providers>
          <AppInitializer>
            <div className="relative z-10 flex flex-col min-h-screen justify-between">
              <Navbar />
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
              <footer className="border-t border-white/5 py-6 bg-zinc-950/40 backdrop-blur-sm relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-zinc-500 text-xs">
                    © 2026 The Celestial Eye. All telemetry computed in real time.
                  </span>
                  <div className="flex gap-4 text-xs text-zinc-400">
                    <a href="#" className="hover:text-primary transition-colors">Telemetry API</a>
                    <a href="#" className="hover:text-primary transition-colors">Terms</a>
                    <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  </div>
                </div>
              </footer>
            </div>
          </AppInitializer>
        </Providers>
      </body>
    </html>
  );
}
