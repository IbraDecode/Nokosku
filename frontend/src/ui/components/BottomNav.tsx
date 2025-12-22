import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'classnames';

type NavItem = {
  label: string;
  icon: string;
  path: string;
};

const defaultItems: NavItem[] = [
  { label: 'Home', icon: 'bi-house-door', path: '/home' },
  { label: 'Beli', icon: 'bi-bag-check', path: '/buy' },
  { label: 'Riwayat', icon: 'bi-clock-history', path: '/orders' },
  { label: 'Profil', icon: 'bi-person', path: '/profile' }
];

export function BottomNav({ items = defaultItems, hidden }: { items?: NavItem[]; hidden?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (hidden) return null;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <button key={item.path} className={clsx(active && 'active')} onClick={() => navigate(item.path)}>
              <i className={`bi ${item.icon}`} />
              <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
