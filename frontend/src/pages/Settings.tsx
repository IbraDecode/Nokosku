import { useState } from 'react';
import { Page } from '../ui/layouts/Page';
import { useTheme } from '../app/theme';
import { useToast } from '../ui/components/Toast';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [notifStatus, setNotifStatus] = useState(Notification.permission);

  const requestNotif = () => {
    Notification.requestPermission().then(status => {
      setNotifStatus(status);
      toast.push({ type: 'info', title: status === 'granted' ? 'Siap kabarin lewat browser.' : 'Notif ditolak.' });
    });
  };

  const openCS = () => {
    window.open('https://t.me/', '_blank');
    toast.push({ type: 'hint', title: 'CS dibuka di tab baru.' });
  };

  return (
    <Page title="Pengaturan" showBack>
      <div className="card-plain">
        <div className="section-title">Tema</div>
        {(['auto', 'light', 'dark'] as const).map(mode => (
          <label key={mode} className="list-row" style={{ padding: '10px 0' }}>
            <div style={{ textTransform: 'capitalize' }}>{mode}</div>
            <input type="radio" checked={theme === mode} onChange={() => setTheme(mode)} />
          </label>
        ))}
      </div>

      <div className="card-plain" style={{ marginTop: 12 }}>
        <div className="list-row" style={{ padding: '10px 0' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Notifikasi browser</div>
            <div className="muted">Status: {notifStatus}</div>
          </div>
          <button className="ghost-btn" style={{ width: 'auto' }} onClick={requestNotif}>
            Aktifkan
          </button>
        </div>
        <div className="list-row" style={{ padding: '10px 0' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Butuh bantuan? chat CS</div>
            <div className="muted">Telegram</div>
          </div>
          <button className="ghost-btn" style={{ width: 'auto' }} onClick={openCS}>
            Buka
          </button>
        </div>
      </div>
    </Page>
  );
}
