// frontend/components/layout/AppInitializer.tsx
// Runs once on app boot. Validates the persisted JWT against the backend
// profile endpoint. If the token is expired or invalid, it clears auth state.
'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/celestialStore';
import { fetchProfile } from '@/lib/api';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    // Validate the persisted token — if expired or invalid, auto-logout
    fetchProfile()
      .then((user) => {
        // Token is still valid — refresh user data in store
        setAuth(user, token);
      })
      .catch(() => {
        // Token is invalid or expired — clear auth
        logout();
      });
    // Only runs on mount with the initial token value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
