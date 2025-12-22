import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getDepositHistory } from '../api/deposit';
import { getOrderHistory } from '../api/orders';
import { useAuth } from '../app/auth';
import { Page } from '../ui/layouts/Page';
import { formatMoney } from '../utils/formatMoney';
import { formatDateTime } from '../utils/formatTime';

export function Home() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: deposits } = useQuery({
    queryKey: ['deposit-history'],
    queryFn: getDepositHistory
  });

  const { data: orders } = useQuery({
    queryKey: ['order-history'],
    queryFn: getOrderHistory
  });

  const lastDeposit = deposits?.[0];
  const lastOrder = orders?.[0];

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width: 40,
            height: 40,
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
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            Hai,
          </div>
          <div style={{ fontWeight: 700 }}>{profile?.name || profile?.email}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/settings')}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: 8 }}
          >
            <i className="bi bi-bell" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, padding: 8 }}
          >
            <i className="bi bi-headset" />
          </button>
        </div>
      </div>

      <div className="balance-block">
        <div className="muted">Saldo kamu</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{formatMoney(profile?.balance || 0)}</div>
        <button
          className="ghost-btn"
          style={{ width: 'auto', padding: '10px 14px', marginTop: 8 }}
          onClick={() => navigate('/deposit')}
        >
          Topup
        </button>
      </div>

      <div className="action-grid">
        <div className="action-tile" onClick={() => navigate('/buy')}>
          <i className="bi bi-bag-check" />
          <span>Beli OTP</span>
        </div>
        <div className="action-tile" onClick={() => navigate('/deposit')}>
          <i className="bi bi-wallet2" />
          <span>Topup</span>
        </div>
        <div className="action-tile" onClick={() => navigate('/orders')}>
          <i className="bi bi-clock-history" />
          <span>Riwayat</span>
        </div>
        <div className="action-tile" onClick={() => navigate('/settings')}>
          <i className="bi bi-headset" />
          <span>Bantuan</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Terakhir</div>
        <div className="card-plain">
          {lastOrder ? (
            <div className="list-row" onClick={() => navigate(`/orders/${lastOrder.id}`)}>
              <div>
                <div style={{ fontWeight: 700 }}>{lastOrder.service}</div>
                <div className="muted">{formatDateTime(lastOrder.created_at)}</div>
              </div>
              <div className="muted">{lastOrder.status}</div>
            </div>
          ) : (
            <div className="muted">Belum ada order.</div>
          )}
          <div className="divider" />
          {lastDeposit ? (
            <div className="list-row" onClick={() => navigate(`/deposit/${lastDeposit.id}`)}>
              <div>
                <div style={{ fontWeight: 700 }}>Deposit</div>
                <div className="muted">{formatDateTime(lastDeposit.created_at)}</div>
              </div>
              <div className="muted">{formatMoney(lastDeposit.nominal)}</div>
            </div>
          ) : (
            <div className="muted">Belum ada topup.</div>
          )}
        </div>
      </div>
    </Page>
  );
}
