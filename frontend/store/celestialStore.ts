// frontend/store/celestialStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/api';

interface CelestialState {
  // Location Selection
  selectedLocation: { latitude: number; longitude: number; label: string } | null;
  setSelectedLocation: (loc: { latitude: number; longitude: number; label: string } | null) => void;

  // Selected Object Selection
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
}

export const useCelestialStore = create<CelestialState>((set) => ({
  // Default to New Delhi coordinates
  selectedLocation: { latitude: 28.6139, longitude: 77.2090, label: 'New Delhi, India' },
  setSelectedLocation: (loc) => set({ selectedLocation: loc }),

  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
}));

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  setError: (err: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: !!token && !!user, error: null, loading: false });
      },
      setError: (err) => set({ error: err, loading: false }),
      setLoading: (loading) => set({ loading }),
      logout: async () => {
        // Call backend to revoke refresh token (best-effort)
        try {
          const { logoutUser } = await import('@/lib/api');
          await logoutUser();
        } catch (_) {}
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        set({ token: null, user: null, isAuthenticated: false, error: null, loading: false });
      },
    }),
    {
      name: 'zenith-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
