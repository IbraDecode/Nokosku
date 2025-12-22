import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CatLottie } from '../ui/components/CatLottie';
import { useAuth } from '../app/auth';

export function Splash() {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(token ? '/home' : '/welcome', { replace: true });
    }, 1100);
    return () => clearTimeout(timer);
  }, [navigate, token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 800 }}>Nokosku</div>
      <CatLottie variant="intro" size="lg" />
      <div className="muted">Siapkan aplikasimu, lagi cek sesi...</div>
    </div>
  );
}
