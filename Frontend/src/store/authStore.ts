import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PublicUser } from '@/types';

type AuthState = {
  accessToken: string | null;
  user: PublicUser | null;
  setSession: (accessToken: string, user: PublicUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => set({ accessToken, user }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    { name: 'globetrotter-auth' },
  ),
);
