import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, PublicUser, AuthResponse } from '../types';

interface AuthState {
  user: User | PublicUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  setSession: (accessToken: string, user: PublicUser | User) => void;
  setUser: (user: User | PublicUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data: AuthResponse) => {
        localStorage.setItem('globetrotter_access_token', data.accessToken);
        localStorage.setItem('globetrotter_refresh_token', data.refreshToken);
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
      },

      setSession: (accessToken: string, user: PublicUser | User) => {
        localStorage.setItem('globetrotter_access_token', accessToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      },

      setUser: (user: User | PublicUser) => {
        set({ user });
      },

      logout: () => {
        localStorage.removeItem('globetrotter_access_token');
        localStorage.removeItem('globetrotter_refresh_token');
        localStorage.removeItem('globetrotter_user');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'globetrotter-auth',
    }
  )
);
