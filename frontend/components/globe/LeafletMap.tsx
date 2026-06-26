// frontend/components/globe/LeafletMap.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useCelestialStore } from '@/store/celestialStore';
import { useISS, useSatellites, usePlanets, useConstellations } from '@/hooks/useCelestialQueries';
import { Planet } from '@/types/api';

// Global map mount counter to force unique React keys on remounts
let mapMountCount = 0;

// Intercept Leaflet's map initialization globally to safely tear down existing instances on reused DOM elements
if (typeof window !== 'undefined') {
  const proto = L.Map.prototype as any;
  const originalInitialize = proto.initialize;
  proto.initialize = function (el: string | HTMLElement, options?: L.MapOptions) {
    const container = typeof el === 'string' ? document.getElementById(el) : el;
    if (container) {
      const existingMap = (container as any)._leaflet_map;
      if (existingMap) {
        try {
          existingMap.remove();
        } catch (e) {
          console.error('Error removing map on reused DOM container:', e);
        }
        delete (container as any)._leaflet_map;
        delete (container as any)._leaflet_id;
      }
      // Guarantee Leaflet internal ID is removed
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    }
    const result = originalInitialize.call(this, el, options);
    if (container) {
      (container as any)._leaflet_map = this;
    }
    return result;
  };
}

// Fix leaflet default icon issue in Next.js
const setupLeafletMarkers = () => {
  if (typeof window === 'undefined') return;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Custom SVG Icons for Sci-Fi styling
const createHtmlIcon = (color: string, shadowColor: string) => {
  return L.divIcon({
    className: 'custom-radar-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full opacity-75" style="background-color: ${shadowColor};"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white" style="background-color: ${color};"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const issIcon = L.divIcon({
  className: 'custom-iss-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-10 w-10 animate-ping rounded-full bg-cyan-400/30 opacity-75"></span>
      <div class="w-8 h-8 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/50">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 10h20M6 6h12M12 2v20M9 6v8M15 6v8M18 10v6M6 10v6"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const planetIcon = L.divIcon({
  className: 'custom-planet-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-amber-500/20 opacity-75"></span>
      <div class="w-6 h-6 rounded-full bg-amber-950/80 border border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50">
        <div class="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
      </div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Map event listener for setting custom location
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LeafletMap() {
  const { selectedLocation, setSelectedLocation, setSelectedObjectId } = useCelestialStore();

  const { data: iss } = useISS();
  const { data: satellites } = useSatellites();
  const { data: planets } = usePlanets();
  
  const { data: constellations } = useConstellations(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );

  const [issPath, setIssPath] = useState<[number, number][]>([]);
  const mapRef = useRef<L.Map | null>(null);
  
  // Use state keys based on mount counts to force new container elements on Strict Mode unmount/remount
  const [mapKey] = useState(() => `leaflet-map-${mapMountCount}-${Math.random()}`);
  const [mapId] = useState(() => `map-container-${mapMountCount}-${Math.random()}`);

  const [gst, setGst] = useState(0);

  // Greenwich Sidereal Time calculation for star projection
  useEffect(() => {
    const updateGST = () => {
      const date = new Date();
      const JD = date.getTime() / 86400000 + 2440587.5;
      const T = (JD - 2451545.0) / 36525.0;
      const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
      setGst(GMST % 360);
    };
    updateGST();
    const timer = setInterval(updateGST, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setupLeafletMarkers();
    return () => {
      // Safely cleanup Leaflet map on unmount
      if (mapRef.current) {
        try {
          if ((mapRef.current as any)._container) {
            mapRef.current.remove();
          }
        } catch (e) {
          console.error('Error cleaning up map container on unmount:', e);
        }
        mapRef.current = null;
      }
      // Increment count on unmount so the next mount uses a completely fresh key/id
      mapMountCount++;
    };
  }, []);

  // Track ISS historical path in local state
  useEffect(() => {
    if (iss) {
      setIssPath((prev) => {
        const newPoint: [number, number] = [iss.latitude, iss.longitude];
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          if (last[0] === newPoint[0] && last[1] === newPoint[1]) {
            return prev;
          }
        }
        return [...prev, newPoint].slice(-60);
      });
    }
  }, [iss]);

  const handleMapClick = (lat: number, lon: number) => {
    setSelectedLocation({
      latitude: lat,
      longitude: lon,
      label: `Scan Point (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
    });
  };

  const center: [number, number] = selectedLocation 
    ? [selectedLocation.latitude, selectedLocation.longitude] 
    : [28.6139, 77.2090];

  // Helper to map star Dec/RA to Earth lat/lon coordinates
  const getStarCoords = (star: any, currentGst: number): [number, number] => {
    const lat = star.dec;
    let lon = star.ra - currentGst;
    lon = ((lon + 180) % 360) - 180;
    return [lat, lon];
  };

  // Helper to calculate a dynamic orbit point for a planet
  const getPlanetPosition = (planet: Planet, time: number) => {
    const nameHash = planet.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const period = planet.orbitalPeriodDays || 365;
    const baseAngle = (time / 1000 / 30) * (360 / period); // Speed up for rendering
    const angleRad = ((baseAngle + nameHash) * Math.PI) / 180;
    const lat = 23.44 * Math.sin(angleRad);
    const lon = (((baseAngle * 5 + nameHash * 13) % 360) - 180);
    return [lat, lon] as [number, number];
  };

  // Helper to calculate the orbital path points of a planet
  const getPlanetOrbitPath = (planet: Planet) => {
    const points: [number, number][] = [];
    const nameHash = planet.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i <= 360; i += 15) {
      const angleRad = ((i + nameHash) * Math.PI) / 180;
      const lat = 23.44 * Math.sin(angleRad);
      const lon = (((i * 5 + nameHash * 13) % 360) - 180);
      points.push([lat, lon]);
    }
    points.sort((a, b) => a[1] - b[1]);
    return points;
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl min-h-[500px]">
      <MapContainer
        key={mapKey}
        id={mapId}
        ref={mapRef}
        center={center}
        zoom={2.5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Selected Location Target */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            icon={createHtmlIcon('#7B61FF', 'rgba(123, 97, 255, 0.4)')}
          >
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-primary">{selectedLocation.label}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Stargazer Radar Scan Center</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ISS Live Marker */}
        {iss && (
          <>
            <Marker position={[iss.latitude, iss.longitude]} icon={issIcon}>
              <Popup>
                <div className="p-1 font-sans text-white">
                  <h4 className="font-bold text-sm text-cyan-400">ISS (ZARYA)</h4>
                  <p className="text-xs text-zinc-400 mt-1">Altitude: ~420 km</p>
                  <p className="text-xs text-zinc-400">Velocity: ~27,600 km/h</p>
                  <button
                    onClick={() => setSelectedObjectId('sat_25544')}
                    className="mt-2 text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Open Telemetry Feed →
                  </button>
                </div>
              </Popup>
            </Marker>
            {issPath.length > 1 && (
              <Polyline
                positions={issPath}
                color="#22d3ee"
                weight={2}
                opacity={0.6}
                dashArray="5, 10"
              />
            )}
          </>
        )}

        {/* Satellites Markers */}
        {satellites && satellites.slice(0, 75).map((sat) => {
          if (sat.latitude === undefined || sat.longitude === undefined) return null;
          return (
            <Marker
              key={sat.id}
              position={[sat.latitude, sat.longitude]}
              icon={createHtmlIcon('#00BFFF', 'rgba(0, 191, 255, 0.3)')}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-xs text-secondary truncate max-w-[150px]">{sat.name}</h4>
                  <p className="text-[10px] text-zinc-400">NORAD: {sat.id}</p>
                  <p className="text-[10px] text-zinc-400">Lat/Lon: {sat.latitude.toFixed(2)}°, {sat.longitude.toFixed(2)}°</p>
                  <button
                    onClick={() => setSelectedObjectId(`sat_${sat.id}`)}
                    className="mt-1.5 text-[10px] font-bold text-secondary hover:underline flex items-center gap-1"
                  >
                    Load Satellite Profile →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Planet Markers & Orbit Paths */}
        {planets && planets.map((planet) => {
          const pos = getPlanetPosition(planet, Date.now());
          const orbitPath = getPlanetOrbitPath(planet);
          return (
            <React.Fragment key={planet.id}>
              {/* Orbit Path */}
              <Polyline
                positions={orbitPath}
                color="#f59e0b"
                weight={1}
                opacity={0.25}
                dashArray="4, 8"
              />
              {/* Planet Marker */}
              <Marker
                position={pos}
                icon={planetIcon}
              >
                <Popup>
                  <div className="p-1 font-sans text-white">
                    <h4 className="font-bold text-sm text-amber-500">{planet.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">Distance from Sun: {planet.distanceFromSunAU} AU</p>
                    <p className="text-xs text-zinc-400">Orbital Period: {planet.orbitalPeriodDays} Days</p>
                    <button
                      onClick={() => setSelectedObjectId(`planet_${planet.id}`)}
                      className="mt-2 text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      Load Planet Profile →
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Constellation overlays */}
        {constellations && constellations.map((constellation) => {
          const starCoords = constellation.stars.map(star => getStarCoords(star, gst));
          const validCoords = starCoords.filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
          if (validCoords.length < 2) return null;
          return (
            <React.Fragment key={constellation.abbreviation}>
              {/* Constellation wireframe */}
              <Polyline
                positions={validCoords}
                color="#eab308"
                weight={1}
                opacity={0.35}
                dashArray="2, 6"
              />
              {/* Stars in constellation */}
              {validCoords.map((coord, sIdx) => {
                const star = constellation.stars[sIdx];
                return (
                  <Marker
                    key={`${constellation.abbreviation}-star-${sIdx}`}
                    position={coord}
                    icon={L.divIcon({
                      className: 'star-dot-marker',
                      html: `<div class="w-1.5 h-1.5 rounded-full bg-yellow-400/80 shadow-[0_0_4px_#facc15]"></div>`,
                      iconSize: [6, 6],
                      iconAnchor: [3, 3],
                    })}
                  >
                    <Popup>
                      <div className="p-1 font-sans text-xs">
                        <p className="font-bold text-yellow-500">{star?.name || 'Unnamed Star'}</p>
                        <p className="text-[10px] text-zinc-400">Constellation: {constellation.name}</p>
                        <p className="text-[10px] text-zinc-400">Magnitude: {star?.mag}</p>
                        <button
                          onClick={() => setSelectedObjectId(`star_${star.id}`)}
                          className="mt-1 text-[10px] font-bold text-yellow-500 hover:underline block"
                        >
                          Load Star Details →
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
    </div>
  );
}
