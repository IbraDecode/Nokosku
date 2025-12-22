import { useNavigate } from 'react-router-dom';
import { CatLottie } from '../ui/components/CatLottie';
import { Page } from '../ui/layouts/Page';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Page>
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <CatLottie variant="notFound" size="lg" />
        <div style={{ marginBottom: 10 }}>Halaman ini nggak ada. Balik dulu ya.</div>
        <button className="primary-btn" onClick={() => navigate('/home')}>
          Ke Home
        </button>
      </div>
    </Page>
  );
}
