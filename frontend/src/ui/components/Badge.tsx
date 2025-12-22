import clsx from 'classnames';

type Props = {
  label: string;
  tone?: 'primary' | 'success' | 'danger' | 'warning' | 'muted';
};

export function Badge({ label, tone = 'primary' }: Props) {
  const colors: Record<string, string> = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    muted: 'var(--muted)'
  };

  return (
    <span
      className={clsx('badge')}
      style={{
        color: colors[tone],
        borderColor: colors[tone],
        background: 'transparent',
        fontWeight: 600
      }}
    >
      {label}
    </span>
  );
}
