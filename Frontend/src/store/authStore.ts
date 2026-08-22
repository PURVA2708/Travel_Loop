import { create } from 'zustand';
import { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('globetrotter_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  accessToken: localStorage.getItem('globetrotter_access_token'),
  refreshToken: localStorage.getItem('globetrotter_refresh_token'),
  isAuthenticated: Boolean(localStorage.getItem('globetrotter_access_token')),

  setAuth: (data: AuthResponse) => {
    localStorage.setItem('globetrotter_access_token', data.accessToken);
    localStorage.setItem('globetrotter_refresh_token', data.refreshToken);
    localStorage.setItem('globetrotter_user', JSON.stringify(data.user));

    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  },

  setUser: (user: User) => {
    localStorage.setItem('globetrotter_user', JSON.stringify(user));
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
}));
