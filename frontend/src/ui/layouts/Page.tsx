import type { ReactNode } from 'react';
import { TopBar } from '../components/TopBar';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  padded?: boolean;
};

export function Page({ title, subtitle, showBack, actions, children, padded = true }: Props) {
  return (
    <div className="page">
      {(title || subtitle || showBack || actions) && (
        <TopBar title={title} subtitle={subtitle} showBack={showBack} actions={actions} />
      )}
      <div className="content-area" style={{ paddingTop: padded ? undefined : 0 }}>
        {children}
      </div>
    </div>
  );
}
