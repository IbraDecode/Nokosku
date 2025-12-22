import { http, setStoredToken } from './http';

export type AuthResponse = {
  success: boolean;
  token: string;
  name?: string;
  email: string;
};

export async function login(payload: { email: string; password: string }) {
  const { data } = await http.post<AuthResponse>('/api/v1/auth/login', payload);
  setStoredToken(data.token);
  return data;
}

export async function register(payload: { email: string; password: string; name?: string }) {
  const { data } = await http.post('/api/v1/auth/register', payload);
  return data;
}
