// ui/layouts/Page.tsx - Layout wrapper untuk halaman
import { type ReactNode } from 'react';
import { TopBar } from '../components/TopBar';

interface PageProps {
  title: string;
  showBack?: boolean;
  rightElement?: ReactNode;
  children: ReactNode;
}

export function Page({ title, showBack, rightElement, children }: PageProps) {
  return (
    <div className="page">
      <TopBar title={title} showBack={showBack} rightElement={rightElement} />
      <div className="page-content">{children}</div>
    </div>
  );
}