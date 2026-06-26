// frontend/components/globe/CesiumGlobe.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useCelestialStore } from '@/store/celestialStore';
import { useISS, useSatellites, usePlanets, useConstellations, useObjectDetail } from '@/hooks/useCelestialQueries';

declare global {
  interface Window {
    Cesium: any;
  }
}

export default function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const { selectedLocation, setSelectedLocation, selectedObjectId, setSelectedObjectId } = useCelestialStore();

  const { data: iss } = useISS();
  const { data: satellites } = useSatellites();
  const { data: planets } = usePlanets(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );
  
  const { data: selectedObjectDetail } = useObjectDetail(
    selectedObjectId,
    selectedLocation?.latitude,
    selectedLocation?.longitude,
  );
  
  const { data: constellations } = useConstellations(
    selectedLocation?.latitude,
    selectedLocation?.longitude
  );

  const [gst, setGst] = useState(0);

  // Auto-updating Greenwich Sidereal Time for constellations and planets
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

  // Initialize Cesium Viewer
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Cesium || !containerRef.current) return;

    const Cesium = window.Cesium;

    // ─── Set Cesium Ion access token ──────────────────────────────────────────
    const ionToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    if (ionToken) {
      Cesium.Ion.defaultAccessToken = ionToken;
    }

    // Set unpkg base URL for web workers and assets
    Cesium.buildModuleUrl.setBaseUrl('https://unpkg.com/cesium@1.118.0/Build/Cesium/');

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      scene3DOnly: true,
      skyAtmosphere: new Cesium.SkyAtmosphere(),   // Realistic blue atmosphere halo
      backgroundColor: Cesium.Color.BLACK,
    });

    // ─── Realistic satellite imagery (Cesium Ion World Imagery / Bing Aerial) ─
    viewer.imageryLayers.removeAll();
    try {
      Cesium.IonImageryProvider.fromAssetId(2).then((provider: any) => {
        viewer.imageryLayers.addImageryProvider(provider);
      }).catch(() => {
        // Fallback to OpenStreetMap if Ion is unavailable
        viewer.imageryLayers.addImageryProvider(
          new Cesium.UrlTemplateImageryProvider({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            credit: 'OpenStreetMap contributors',
          })
        );
      });
    } catch (_) {
      // Synchronous fallback for old Cesium API (fromAssetId not available)
      try {
        viewer.imageryLayers.addImageryProvider(
          new Cesium.IonImageryProvider({ assetId: 2 })
        );
      } catch (__) {}
    }

    // ─── Realistic atmosphere & lighting ─────────────────────────────────────
    try { viewer.scene.globe.enableLighting = true; } catch (_) {}
    try { viewer.scene.globe.depthTestAgainstTerrain = true; } catch (_) {}
    try { viewer.scene.globe.show = true; } catch (_) {}
    try { viewer.scene.skyBox.show = true; } catch (_) {}
    try { viewer.scene.sun.show = true; } catch (_) {}
    try { viewer.scene.moon.show = true; } catch (_) {}

    // ─── Cesium World Terrain for realistic 3D elevation ─────────────────────
    try {
      Cesium.createWorldTerrainAsync({
        requestWaterMask: true,
        requestVertexNormals: true,
      }).then((terrain: any) => {
        viewer.terrainProvider = terrain;
      }).catch(() => {});
    } catch (_) {
      try {
        viewer.terrainProvider = Cesium.createWorldTerrain({
          requestWaterMask: true,
          requestVertexNormals: true,
        });
      } catch (__) {}
    }

    // ─── Screen click handler for setting observer location ───────────────────
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((clickEvent: any) => {
      const cartesian = viewer.camera.pickEllipsoid(clickEvent.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        setSelectedLocation({
          latitude: lat,
          longitude: lon,
          label: `Scan Point (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`,
        });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;

    // ─── Suppress Cesium CDN internal errors ──────────────────────────────────
    try {
      viewer.scene.renderError.addEventListener((_scene: any, error: any) => {
        console.warn('[Cesium] Non-fatal render error (suppressed):', error);
      });
    } catch (_) {}

    // ─── Camera: centered over India, 18,000 km altitude ─────────────────────
    // Longitude 78.9, Latitude 20.6 — geographic centre of India
    try {
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(78.9, 20.6, 18_000_000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-90),
          roll: 0,
        },
      });
    } catch (_) {}

    // ─── Camera Field of View: 60° keeps the full globe visible ──────────────
    try {
      viewer.scene.camera.frustum.fov = Cesium.Math.toRadians(60);
    } catch (_) {}

    // ─── Zoom limits: prevents globe from leaving the viewport ────────────────
    // minimumZoomDistance: 3,500 km — close enough to see continents clearly
    // maximumZoomDistance: 30,000 km — far enough to see the whole Earth
    try {
      viewer.scene.screenSpaceCameraController.minimumZoomDistance = 3_500_000;
      viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30_000_000;
    } catch (_) {}

    // ─── Force canvas resize to match container immediately ──────────────────
    try { viewer.resize(); } catch (_) {}
    try { viewer.forceResize(); } catch (_) {}

    // ─── ResizeObserver: keeps canvas in sync when the panel resizes ─────────
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (!viewerRef.current) return;
        try { viewerRef.current.resize(); } catch (_) {}
        try { viewerRef.current.forceResize(); } catch (_) {}
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      try { handler.destroy(); } catch (_) {}
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.warn('Cesium viewer cleanup warning (non-fatal):', e);
        }
        viewerRef.current = null;
      }
    };
  }, []);


  // Update Observer Selected Location on the 3D globe
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || typeof window === 'undefined' || !selectedLocation) return;
    const Cesium = window.Cesium;

    const lat = selectedLocation.latitude;
    const lon = selectedLocation.longitude;
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return;

    // Remove existing target entity
    const existing = viewer.entities.getById('observer-pin');
    if (existing) viewer.entities.remove(existing);

    // Render observer marker
    viewer.entities.add({
      id: 'observer-pin',
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#7B61FF'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: 'SCAN TARGET',
        font: 'bold 10px monospace',
        fillColor: Cesium.Color.fromCssColorString('#7B61FF'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -12),
      },
    });

    // Animate camera to focus on observer target
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 10000000.0),
      duration: 1.5,
    });
  }, [selectedLocation]);

  // Render ISS + Orbit Path (SGP4 propagated)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || typeof window === 'undefined' || !iss) return;
    const Cesium = window.Cesium;

    const latIss = iss.latitude;
    const lonIss = iss.longitude;
    if (isNaN(latIss) || isNaN(lonIss) || latIss < -90 || latIss > 90 || lonIss < -180 || lonIss > 180) return;

    const existingIss = viewer.entities.getById('iss-sat');
    if (existingIss) viewer.entities.remove(existingIss);

    viewer.entities.add({
      id: 'iss-sat',
      position: Cesium.Cartesian3.fromDegrees(lonIss, latIss, 420000.0),
      point: {
        pixelSize: 15,
        color: Cesium.Color.fromCssColorString('#22d3ee'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: 'ISS (ZARYA)',
        font: 'bold 10px monospace',
        fillColor: Cesium.Color.fromCssColorString('#22d3ee'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -15),
      },
    });

    // Render true SGP4 ISS Orbit Line
    const existingOrbit = viewer.entities.getById('iss-orbit');
    if (existingOrbit) viewer.entities.remove(existingOrbit);

    const orbitPoints: any[] = [];
    if (iss.orbitPoints && Array.isArray(iss.orbitPoints)) {
      iss.orbitPoints.forEach((pt) => {
        orbitPoints.push(Cesium.Cartesian3.fromDegrees(pt.longitude, pt.latitude, pt.altitude * 1000));
      });
    } else {
      // Fallback approximation while loading
      for (let i = 0; i <= 360; i += 10) {
        const rad = i * Math.PI / 180;
        const lat = 51.6 * Math.sin(rad);
        const lon = ((lonIss + i) % 360) - 180;
        orbitPoints.push(Cesium.Cartesian3.fromDegrees(lon, lat, 420000.0));
      }
    }

    if (orbitPoints.length > 0) {
      viewer.entities.add({
        id: 'iss-orbit',
        polyline: {
          positions: orbitPoints,
          width: 1.5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.6),
            dashLength: 16.0,
          }),
        },
      });
    }
  }, [iss]);

  // Render Satellites + Highlights & Orbit Paths
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || typeof window === 'undefined' || !satellites) return;
    const Cesium = window.Cesium;

    // Clear existing satellite elements
    const idsToRemove = viewer.entities.values
      .map((e: any) => e.id)
      .filter((id: string) => id.startsWith('sat-pt-') || id.startsWith('selected-sat-orbit'));
    idsToRemove.forEach((id: string) => viewer.entities.removeById(id));

    satellites.slice(0, 80).forEach((sat) => {
      if (sat.latitude === undefined || sat.longitude === undefined) return;
      const lat = sat.latitude;
      const lon = sat.longitude;
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return;

      const isSelected = selectedObjectId === `sat_${sat.id}`;

      viewer.entities.add({
        id: `sat-pt-${sat.id}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, (sat.altitude || 500) * 1000),
        point: {
          pixelSize: isSelected ? 14 : 7,
          color: isSelected ? Cesium.Color.fromCssColorString('#f43f5e') : Cesium.Color.fromCssColorString('#00BFFF'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: isSelected ? 2 : 1,
        },
        label: isSelected ? {
          text: sat.name,
          font: 'bold 11px monospace',
          fillColor: Cesium.Color.fromCssColorString('#f43f5e'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -15),
        } : undefined,
      });

      // Draw Selected Satellite Orbit Line (True SGP4)
      if (isSelected) {
        const orbitPoints: any[] = [];
        if (selectedObjectDetail && selectedObjectDetail.id === sat.id && selectedObjectDetail.orbitPoints) {
          selectedObjectDetail.orbitPoints.forEach((pt: any) => {
            orbitPoints.push(Cesium.Cartesian3.fromDegrees(pt.longitude, pt.latitude, pt.altitude * 1000));
          });
        } else {
          // Circular approximation fallback
          const inc = 55 * Math.PI / 180;
          const altMeters = (sat.altitude || 500) * 1000;
          for (let i = 0; i <= 360; i += 5) {
            const rad = i * Math.PI / 180;
            const latOrbit = Math.asin(Math.sin(inc) * Math.sin(rad)) * 180 / Math.PI;
            const lonOrbit = (((rad * 180 / Math.PI) + lon) % 360) - 180;
            orbitPoints.push(Cesium.Cartesian3.fromDegrees(lonOrbit, latOrbit, altMeters));
          }
        }

        if (orbitPoints.length > 0) {
          viewer.entities.add({
            id: 'selected-sat-orbit',
            polyline: {
              positions: orbitPoints,
              width: 2.5,
              material: Cesium.Color.fromCssColorString('#f43f5e').withAlpha(0.8),
            },
          });
        }
      }
    });
  }, [satellites, selectedObjectId, selectedObjectDetail]);

  // Render Planet geocentric positions projected on the celestial sphere
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || typeof window === 'undefined' || !planets) return;
    const Cesium = window.Cesium;

    // Clear planet markers
    const planetIds = viewer.entities.values
      .map((e: any) => e.id)
      .filter((id: string) => id.startsWith('planet-pt-'));
    planetIds.forEach((id: string) => viewer.entities.removeById(id));

    planets.forEach((planet) => {
      let lat = 0;
      let lon = 0;
      // Project onto celestial sphere shell at 4,000,000 meters (4,000 km)
      const celestialRadius = 4000000.0;

      if (planet.ra !== undefined && planet.dec !== undefined) {
        lat = planet.dec;
        lon = planet.ra - gst;
        lon = ((lon + 180) % 360) - 180;
      } else {
        // Fallback calculations using static angles if coordinates not supplied
        const nameHash = planet.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const period = planet.orbitalPeriodDays || 365;
        const angle = (Date.now() / 1000 / 30) * (360 / period);
        lat = 23.44 * Math.sin(((angle + nameHash) * Math.PI) / 180);
        lon = (((angle * 5 + nameHash * 13) % 360) - 180);
      }

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return;

      viewer.entities.add({
        id: `planet-pt-${planet.id}`,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, celestialRadius),
        point: {
          pixelSize: 10,
          color: Cesium.Color.fromCssColorString('#f59e0b'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1.5,
        },
        label: {
          text: planet.name,
          font: 'bold 9px monospace',
          fillColor: Cesium.Color.fromCssColorString('#f59e0b'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
        },
      });
    });
  }, [planets, gst]);

  // Render Constellation Overlays
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || typeof window === 'undefined' || !constellations) return;
    const Cesium = window.Cesium;

    // Remove existing constellation objects
    const cIds = viewer.entities.values
      .map((e: any) => e.id)
      .filter((id: string) => id.startsWith('constellation-'));
    cIds.forEach((id: string) => viewer.entities.removeById(id));

    constellations.forEach((c) => {
      const starCoords = c.stars.map((star) => {
        const lat = star.dec;
        let lon = star.ra - gst;
        lon = ((lon + 180) % 360) - 180;
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
        return Cesium.Cartesian3.fromDegrees(lon, lat, 3500000.0); // Floating at 3500km space cage
      }).filter((coord): coord is any => coord !== null);

      // Draw Outlines
      if (starCoords.length >= 2) {
        viewer.entities.add({
          id: `constellation-line-${c.abbreviation}`,
          polyline: {
            positions: starCoords,
            width: 1,
            material: Cesium.Color.fromCssColorString('#facc15').withAlpha(0.25),
          },
        });
      }

      // Draw Stars
      c.stars.forEach((star, sIdx) => {
        const coord = starCoords[sIdx];
        if (!coord) return;
        viewer.entities.add({
          id: `constellation-star-${c.abbreviation}-${star.id}-${sIdx}`,
          position: coord,
          point: {
            pixelSize: 3,
            color: Cesium.Color.fromCssColorString('#facc15').withAlpha(0.8),
          },
        });
      });
    });
  }, [constellations, gst]);

  return (
    /*
     * Outer wrapper — must be position:relative so the absolute-fill children
     * stack inside it. overflow:hidden is the hard clip that prevents any part
     * of the Cesium canvas from bleeding outside the panel. No min-h here;
     * height comes entirely from the parent flex layout in explore/page.tsx.
     */
    <div
      className="w-full h-full rounded-2xl border border-white/10 shadow-2xl"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Cesium mounts into this div — it must fill the parent exactly */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      />
      {/* HUD scanline overlay — pointer-events none so globe stays interactive */}
      <div
        className="absolute inset-0 pointer-events-none border border-primary/20 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-15"
        style={{ backgroundSize: '100% 4px' }}
      />
    </div>
  );
}

