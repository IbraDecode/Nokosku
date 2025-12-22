import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../app/auth';
import { Page } from '../ui/layouts/Page';
import { http } from '../api/http';

type AdminStats = { totalUsers: number; totalDeposits: number; totalOrders: number; totalProfit: number };

export function Admin() {
  const { profile } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await http.get<{ success: boolean; stats: AdminStats }>('/api/v1/admin/stats');
      return data.stats;
    },
    enabled: !!profile?.is_admin
  });

  return (
    <Page title="Admin Panel" showBack>
      {!profile?.is_admin && <div className="muted">Bukan admin.</div>}
      {isLoading && <div className="muted">Lagi ambil data...</div>}
      {data && (
        <div className="card-plain" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="list-row">
            <span>User</span>
            <strong>{data.totalUsers}</strong>
          </div>
          <div className="list-row">
            <span>Total deposit</span>
            <strong>{data.totalDeposits}</strong>
          </div>
          <div className="list-row">
            <span>Total order</span>
            <strong>{data.totalOrders}</strong>
          </div>
          <div className="list-row">
            <span>Profit</span>
            <strong>{data.totalProfit}</strong>
          </div>
        </div>
      )}
    </Page>
  );
}
