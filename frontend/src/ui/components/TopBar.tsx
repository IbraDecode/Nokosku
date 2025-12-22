import { useNavigate } from 'react-router-dom';
import clsx from 'classnames';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
};

export function TopBar({ title, subtitle, showBack, actions, className }: Props) {
  const navigate = useNavigate();

  return (
    <div className={clsx('top-bar', className)}>
      {showBack && (
        <button
          aria-label="Kembali"
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', padding: 6 }}
        >
          <i className="bi bi-arrow-left" />
        </button>
      )}
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700 }}>{title}</div>}
        {subtitle && <div className="muted" style={{ fontSize: '0.9rem' }}>{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}
