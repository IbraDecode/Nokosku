import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelOrder, getOrder, resendOtp } from '../api/orders';
import { Page } from '../ui/layouts/Page';
import { Badge } from '../ui/components/Badge';
import { CatLottie } from '../ui/components/CatLottie';
import { copyText } from '../utils/copy';
import { useToast } from '../ui/components/Toast';
import { useSocket } from '../app/socket';

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [notifAllowed, setNotifAllowed] = useState(Notification.permission === 'granted');
  const [timeLeft, setTimeLeft] = useState<string>('');

  const { data, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(String(id)),
    enabled: !!id,
    refetchInterval: query => (query.state.data?.order?.status === 'pending' ? 6000 : false)
  });

  const order = data?.order;

  useEffect(() => {
    const expiresAt = order?.expired_at;
    if (!expiresAt) return;
    const timer = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) setTimeLeft('kadaluarsa');
      else setTimeLeft(`sisa ${Math.ceil(diff / 60000)} menit`);
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.expired_at]);

  useEffect(() => {
    if (!socket) return;
    const otpHandler = (payload: any) => {
      if (payload?.order_id?.toString() === id) {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
        toast.push({ type: 'success', title: 'OTP masuk! Langsung salin aja.' });
        if (notifAllowed && payload?.otp) {
          new Notification('OTP masuk!', {
            body: `Dari nomor ${payload.nomor} — OTP ${payload.otp}`
          });
        }
      }
    };
    const expiredHandler = (payload: any) => {
      if (payload?.order_id?.toString() === id) {
        queryClient.invalidateQueries({ queryKey: ['order', id] });
        toast.push({ type: 'error', title: 'Waktunya habis, saldo kamu aman.' });
      }
    };
    socket.on('order:otp_received', otpHandler);
    socket.on('order:expired', expiredHandler);
    return () => {
      socket.off('order:otp_received', otpHandler);
      socket.off('order:expired', expiredHandler);
    };
  }, [socket, id, queryClient, toast, notifAllowed]);

  const badgeTone = useMemo(() => {
    if (order?.status === 'otp_received') return 'success';
    if (order?.status === 'pending') return 'warning';
    if (order?.status === 'expired') return 'danger';
    if (order?.status === 'cancel') return 'muted';
    return 'primary';
  }, [order?.status]);

  const handleCopy = async (text?: string) => {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) toast.push({ type: 'success', title: 'Disalin.' });
  };

  const handleResend = async () => {
    if (!id) return;
    try {
      await resendOtp(id);
      toast.push({ type: 'info', title: 'OTP dikirim ulang.' });
      refetch();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Gagal resend.';
      toast.push({ type: 'error', title: message });
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelOrder(id);
      toast.push({ type: 'info', title: 'Order dibatalkan.' });
      refetch();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Gagal cancel.';
      toast.push({ type: 'error', title: message });
    }
  };

  const askNotif = () => {
    Notification.requestPermission().then(status => setNotifAllowed(status === 'granted'));
  };

  return (
    <Page title="Detail Order" showBack>
      {!order ? (
        <div className="muted">Lagi ambil data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Badge label={order.status} tone={badgeTone as any} />
            {order.expired_at && <div className="muted">{timeLeft}</div>}
          </div>
          <div className="card-plain">
            <div className="muted">Nomor</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 700 }}>
              <span>{order.number}</span>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)' }}
                onClick={() => handleCopy(order.number)}
              >
                <i className="bi bi-clipboard" />
              </button>
            </div>
            <div className="muted">Aplikasi: {order.service}</div>
            <div className="muted">Negara: {order.country}</div>
          </div>

          <div className="otp-box">
            {!order.otp_code ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CatLottie variant="loading" size="sm" />
                <div>
                  <div>Nunggu OTP masuk...</div>
                  <button
                    type="button"
                    className="ghost-btn"
                    style={{ width: 'auto', padding: '8px 12px', marginTop: 6 }}
                    onClick={askNotif}
                  >
                    Mau dikabarin pas OTP masuk?
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{order.otp_code}</div>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)' }}
                  onClick={() => handleCopy(order.otp_code)}
                >
                  <i className="bi bi-clipboard" /> Salin OTP
                </button>
              </div>
            )}
          </div>

          {order.status === 'pending' && (
            <div className="two-col">
              <button className="primary-btn" type="button" onClick={handleResend}>
                Resend OTP
              </button>
              <button className="ghost-btn" type="button" onClick={handleCancel}>
                Batalkan
              </button>
            </div>
          )}
          {order.status === 'expired' && (
            <div style={{ textAlign: 'center' }}>
              <CatLottie variant="error" size="md" />
              <div>Waktunya habis, saldo kamu aman.</div>
              <button className="primary-btn" onClick={() => navigate('/buy')}>
                Pesan baru
              </button>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
