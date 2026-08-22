import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      useAuthStore.getState().accessToken ||
      localStorage.getItem('globetrotter_access_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout?.();
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || fallback;
  }
  return fallback;
}

export default api;
