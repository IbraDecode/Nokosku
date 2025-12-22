import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = {
  label?: string;
  icon?: string;
  rightSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, icon, rightSlot, type = 'text', ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="form-field">
      {label && <label style={{ fontWeight: 600 }}>{label}</label>}
      <div className="input-wrapper">
        {icon && <i className={`bi ${icon}`} style={{ color: 'var(--muted)' }} />}
        <input type={isPassword ? (show ? 'text' : 'password') : type} {...rest} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted)' }}
          >
            <i className={`bi ${show ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>
        )}
        {rightSlot}
      </div>
    </div>
  );
}
