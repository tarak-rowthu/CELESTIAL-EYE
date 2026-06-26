// frontend/components/globe/Globe.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../ui/LoadingSpinner';

// Dynamic import — disables SSR since Cesium requires window/WebGL
const CesiumGlobe = dynamic(() => import('./CesiumGlobe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-950/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
      <LoadingSpinner label="Calibrating 3D Orbital Globe & Calibrating Feeds..." size="lg" />
    </div>
  ),
});

export default function Globe() {
  return (
    // position:absolute + inset:0 makes this fill whatever the parent container
    // measures — works with both explicit heights and flex-stretched parents.
    <div
      className="absolute inset-0 w-full h-full"
      style={{ overflow: 'hidden' }}
    >
      <CesiumGlobe />
    </div>
  );
}
