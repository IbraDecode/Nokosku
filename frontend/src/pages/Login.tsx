import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../app/auth';
import { Input } from '../ui/components/Input';
import { useToast } from '../ui/components/Toast';
import { Page } from '../ui/layouts/Page';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await login({ email, password });
      toast.push({ type: 'success', title: 'Masuk. lanjut ya.' });
      navigate('/home', { replace: true });
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Bentar, sistem lagi ngambek. Coba lagi.';
      toast.push({ type: 'error', title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-shield-lock" />
          <span className="muted">Nokosku</span>
        </div>
        <h2 style={{ margin: '4px 0' }}>Welcome back!</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            icon="bi-envelope"
            type="email"
            placeholder="email kamu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            icon="bi-lock"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="muted" style={{ marginBottom: 12 }}>
            Lupa password? <span style={{ opacity: 0.5 }}>belum tersedia</span>
          </div>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Sebentar...' : 'Login'}
          </button>
        </form>
        <div style={{ textAlign: 'center' }}>
          <span className="muted">Belum punya akun? </span>
          <Link to="/register">Daftar</Link>
        </div>
      </div>
    </Page>
  );
}
