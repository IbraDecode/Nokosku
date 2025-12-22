import { useNavigate } from 'react-router-dom';
import { CatLottie } from '../ui/components/CatLottie';
import { Page } from '../ui/layouts/Page';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'left' }}>
        <CatLottie variant="welcome" size="lg" />
        <div>
          <h2 style={{ margin: '10px 0', fontSize: 26 }}>Beli nomor OTP, tanpa ribet.</h2>
          <div className="muted">Pilih aplikasi → bayar → OTP masuk realtime.</div>
        </div>
        <button className="primary-btn" onClick={() => navigate('/login')}>
          Mulai
        </button>
        <button className="ghost-btn" onClick={() => navigate('/register')}>
          Saya baru, bikin akun
        </button>
      </div>
    </Page>
  );
}
