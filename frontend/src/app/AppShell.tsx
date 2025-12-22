import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from '../ui/components/BottomNav';
import { useAuth } from './auth';
import { useTheme } from './theme';
import { preloadLotties } from './lottie-preload';

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const hideNav = ['/', '/welcome', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    preloadLotties();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const appName = import.meta.env.VITE_APP_NAME || 'Nokosku';
    document.title = `${appName} — Nomor OTP instan`;
  }, []);

  useEffect(() => {
    if (!token && ['/home', '/buy', '/orders', '/profile', '/deposit', '/settings'].includes(location.pathname)) {
      navigate('/login', { replace: true });
    }
  }, [token, location.pathname, navigate]);

  return (
    <div className="app-shell">
      <div className="app-frame">
        {children}
        <BottomNav hidden={hideNav} />
      </div>
      <aside
        className="side-help"
        style={{
          display: window.innerWidth > 1024 ? 'block' : 'none',
          marginLeft: 18,
          color: 'var(--muted)'
        }}
      >
        <div style={{ position: 'sticky', top: 20, maxWidth: 260 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Butuh bantuan?</div>
          <div style={{ fontSize: '0.95rem' }}>CS siap di Settings → chat CS.</div>
        </div>
      </aside>
    </div>
  );
}
