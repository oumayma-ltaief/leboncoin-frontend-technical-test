'use client';

import { ConversationParticipantContext } from '../../contexts/conversation-participant/conversation-participant';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import type { ReactNode } from 'react';
import { redirect, RedirectType } from 'next/navigation';
import { useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

interface ActiveUserConversationGuardProps {
  children: ReactNode;
  conversationId: number;
}

export function ActiveUserConversationGuard({ children, conversationId }: ActiveUserConversationGuardProps) {
  const { isActiveUserParticipantOfConversation, isLoadingConversationList } = useActiveUserConversations();
  const { activeUser, isLoadingUserList } = useUserSession();

  if (isLoadingUserList || isLoadingConversationList) {
    return null;
  }
  if (!activeUser || !isActiveUserParticipantOfConversation(conversationId)) {
    return redirect(CONVERSATIONS_URL, RedirectType.replace);
  }

  const conversationPageKey = `${String(activeUser.id)}-${String(conversationId)}`;

  return (
    <ConversationParticipantContext key={conversationPageKey} value={activeUser}>
      {children}
    </ConversationParticipantContext>
  );
}
