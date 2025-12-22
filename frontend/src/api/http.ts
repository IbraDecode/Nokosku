import axios, { type AxiosRequestHeaders } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const authTokenKey = 'nk_token';

export function getStoredToken() {
  return localStorage.getItem(authTokenKey) || '';
}

export function setStoredToken(token: string) {
  if (token) {
    localStorage.setItem(authTokenKey, token);
  } else {
    localStorage.removeItem(authTokenKey);
  }
}

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 20000
});

http.interceptors.request.use(config => {
  const token = getStoredToken();
  if (token) {
    const headers: AxiosRequestHeaders = (config.headers as AxiosRequestHeaders) || {};
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

http.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status;
    if (status === 401) {
      setStoredToken('');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
