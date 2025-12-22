import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderHistory } from '../api/orders';
import { Page } from '../ui/layouts/Page';
import { formatDateTime } from '../utils/formatTime';
import { CatLottie } from '../ui/components/CatLottie';

export function Orders() {
  const navigate = useNavigate();
  const [statusFilter, setFilter] = useState<string>('all');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['order-history'],
    queryFn: getOrderHistory
  });

  const filtered = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === 'all') return orders;
    return orders.filter(o => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <Page title="Riwayat" showBack>
      <div className="chip-row" style={{ marginBottom: 12 }}>
        {['all', 'pending', 'processing', 'otp_received', 'expired', 'cancel'].map(s => (
          <button
            key={s}
            className={`chip ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <CatLottie variant="loading" size="md" />}
      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <CatLottie variant="hint" size="md" />
          <div className="muted">Belum ada riwayat. Coba beli dulu.</div>
        </div>
      )}

      <div className="card-plain">
        {filtered.map(o => (
          <div key={o.id} className="list-row" onClick={() => navigate(`/orders/${o.id}`)}>
            <div>
              <div style={{ fontWeight: 700 }}>{o.service}</div>
              <div className="muted">
                {o.number} · {formatDateTime(o.created_at)}
              </div>
            </div>
            <div className="muted">{o.status}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}
