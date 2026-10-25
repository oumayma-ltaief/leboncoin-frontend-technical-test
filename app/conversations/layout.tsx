import { ConversationsLayout } from '../../src/app/features/conversations/layout/conversations-layout/conversations-layout';
import type { ReactNode } from 'react';

export default function ConversationsRouteLayout({ children }: { children: ReactNode }) {
  return <ConversationsLayout>{children}</ConversationsLayout>;
}
