import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../ui/components/Input';
import { useToast } from '../ui/components/Toast';
import { useAuth } from '../app/auth';
import { Page } from '../ui/layouts/Page';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.push({ type: 'error', title: 'Password tidak sama.' });
      return;
    }
    setLoading(true);
    try {
      await register({ email, password });
      toast.push({ type: 'love', title: 'Akun jadi, lanjut yuk.' });
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
          <button
            aria-label="Kembali"
            onClick={() => navigate(-1)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text)' }}
          >
            <i className="bi bi-arrow-left" />
          </button>
          <span className="muted">Nokosku</span>
        </div>
        <h2 style={{ margin: '4px 0' }}>Bikin akun dulu</h2>
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
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Password"
            icon="bi-lock-fill"
            type="password"
            placeholder="Ulangi password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Sebentar...' : 'Daftar'}
          </button>
        </form>
        <div style={{ textAlign: 'center' }}>
          <span className="muted">Sudah punya akun? </span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </Page>
  );
}
