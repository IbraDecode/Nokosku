import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/auth';
import { Page } from '../ui/layouts/Page';
import { formatMoney } from '../utils/formatMoney';

export function Profile() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Page title="Akun" showBack>
      <div className="card-plain" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 999,
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border)'
          }}
        >
          <i className="bi bi-person" />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{profile?.email}</div>
          <div className="muted">{profile?.name}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontWeight: 700 }}>{formatMoney(profile?.balance || 0)}</div>
      </div>

      <div className="card-plain" style={{ marginTop: 12 }}>
        <div className="list-row" onClick={() => navigate('/deposit')}>
          <span>Riwayat deposit</span>
          <i className="bi bi-chevron-right" />
        </div>
        <div className="list-row" onClick={() => navigate('/orders')}>
          <span>Riwayat order</span>
          <i className="bi bi-chevron-right" />
        </div>
        <div className="list-row" onClick={() => navigate('/settings')}>
          <span>Pengaturan</span>
          <i className="bi bi-chevron-right" />
        </div>
        <div className="list-row" onClick={logout}>
          <span>Logout</span>
          <i className="bi bi-box-arrow-right" />
        </div>
      </div>
    </Page>
  );
}
