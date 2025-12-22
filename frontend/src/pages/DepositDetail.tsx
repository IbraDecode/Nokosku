import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelDeposit, getDeposit } from '../api/deposit';
import { Page } from '../ui/layouts/Page';
import { Badge } from '../ui/components/Badge';
import { CatLottie } from '../ui/components/CatLottie';
import { formatMoney } from '../utils/formatMoney';
import { formatRelativeMinutes } from '../utils/formatTime';
import { useToast } from '../ui/components/Toast';
import { useSocket } from '../app/socket';

export function DepositDetail() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data, refetch } = useQuery({
    queryKey: ['deposit', id],
    queryFn: () => getDeposit(String(id)),
    enabled: !!id,
    refetchInterval: query => {
      const status = query.state.data?.deposit?.status;
      return status === 'pending' ? 7000 : false;
    }
  });

  const deposit = data?.deposit;
  const status = data?.status || deposit?.status;

  useEffect(() => {
    if (!socket) return;
    const paidHandler = (payload: any) => {
      if (payload?.deposit_id?.toString() === id) {
        queryClient.invalidateQueries({ queryKey: ['deposit', id] });
        toast.push({ type: 'success', title: 'Saldo udah masuk.' });
      }
    };
    socket.on('deposit:paid', paidHandler);
    return () => {
      socket.off('deposit:paid', paidHandler);
    };
  }, [socket, id, queryClient, toast]);

  const badgeTone =
    status === 'success' ? 'success' : status === 'pending' ? 'warning' : status === 'cancel' ? 'muted' : 'danger';

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelDeposit(id);
      toast.push({ type: 'info', title: 'Deposit dibatalkan.' });
      refetch();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Gagal cancel.';
      toast.push({ type: 'error', title: message });
    }
  };

  const qrImage =
    deposit?.provider_response?.qr_image ||
    deposit?.provider_response?.qr_url ||
    deposit?.provider_response?.qr ||
    deposit?.provider_response?.payment_qr_image;

  return (
    <Page title="Detail Deposit" showBack>
      {!deposit ? (
        <div className="muted">Lagi ambil data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge label={status || deposit.status} tone={badgeTone as any} />
            <div style={{ fontWeight: 700 }}>{formatMoney(deposit.nominal)}</div>
          </div>

          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <CatLottie variant="successCheck" size="lg" />
              <div style={{ marginBottom: 10 }}>Saldo udah masuk.</div>
              <button className="primary-btn" onClick={() => navigate('/home')}>
                Balik ke Home
              </button>
            </div>
          ) : (
            <>
              {qrImage && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={qrImage}
                    alt="QR Pembayaran"
                    style={{ width: 260, height: 260, objectFit: 'contain', borderRadius: 12 }}
                  />
                </div>
              )}
              {deposit.provider_response?.qr_string && (
                <div className="muted" style={{ wordBreak: 'break-all' }}>
                  {deposit.provider_response.qr_string}
                </div>
              )}
              {status === 'pending' && deposit.expires_at && (
                <div className="muted">
                  Kadaluarsa {formatRelativeMinutes(new Date(deposit.expires_at).getTime() - Date.now())}
                </div>
              )}
              <div className="two-col">
                <button className="primary-btn" type="button" onClick={() => refetch()}>
                  Saya sudah bayar
                </button>
                <button className="ghost-btn" type="button" onClick={handleCancel}>
                  Batalkan
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Page>
  );
}
