import { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, register as registerApi } from '../api/auth';
import { getProfile } from '../api/user';
import type { Profile } from '../api/user';
import { getStoredToken, setStoredToken } from '../api/http';

type AuthContextType = {
  token: string;
  profile?: Profile;
  isProfileLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string>(() => getStoredToken());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !!token
  });

  const login = async (payload: { email: string; password: string }) => {
    const res = await loginApi(payload);
    setStoredToken(res.token);
    setToken(res.token);
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  const register = async (payload: { email: string; password: string; name?: string }) => {
    await registerApi(payload);
    await login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    setStoredToken('');
    setToken('');
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      token,
      profile,
      isProfileLoading,
      login,
      register,
      logout
    }),
    [token, profile, isProfileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam AuthProvider');
  return ctx;
}
