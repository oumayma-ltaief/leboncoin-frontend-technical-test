import { Header } from './layout/header/header';
import type { ReactNode } from 'react';

export function App({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col bg-surface text-content">
      <Header />
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
