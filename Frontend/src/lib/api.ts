import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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
    const token = localStorage.getItem('globetrotter_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('globetrotter_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          if (res.data.success && res.data.data) {
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            localStorage.setItem('globetrotter_access_token', accessToken);
            if (newRefresh) {
              localStorage.setItem('globetrotter_refresh_token', newRefresh);
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          }
        } catch {
          // Token refresh failed -> clear auth
          localStorage.removeItem('globetrotter_access_token');
          localStorage.removeItem('globetrotter_refresh_token');
          localStorage.removeItem('globetrotter_user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
