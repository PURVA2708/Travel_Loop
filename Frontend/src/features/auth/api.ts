import { api } from '@/lib/api';
import type { PublicUser } from '@/types';

type AuthResponse = { user: PublicUser; accessToken: string; refreshToken: string };

export async function signupRequest(input: { name: string; email: string; password: string }) {
  const { data } = await api.post<AuthResponse>('/auth/signup', input);
  return data;
}

export async function loginRequest(input: { email: string; password: string }) {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}
