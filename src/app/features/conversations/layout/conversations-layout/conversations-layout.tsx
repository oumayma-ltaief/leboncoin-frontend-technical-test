'use client';

import { ConversationList } from '../../components/conversation-list/conversation-list';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';

export function ConversationsLayout({ children }: { children: ReactNode }) {
  const isConversationOpen = useParams<{ conversationId?: string }>().conversationId !== undefined;

  return (
    <div className="flex h-full">
      <aside className={`w-full shrink-0 flex-col border-r border-line bg-surface md:flex md:w-80 ${isConversationOpen ? 'hidden' : 'flex'}`}>
        <ConversationList />
      </aside>

      <section aria-label="Conversation" className={`min-w-0 flex-1 flex-col bg-surface-muted md:flex ${isConversationOpen ? 'flex' : 'hidden'}`}>
        {children}
      </section>
    </div>
  );
}
