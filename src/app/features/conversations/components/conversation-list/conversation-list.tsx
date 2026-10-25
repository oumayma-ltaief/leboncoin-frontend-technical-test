'use client';

import { ConversationItem } from '../conversation-item/conversation-item';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { NewConversation } from '../new-conversation/new-conversation';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

function ConversationListContent() {
  const { conversationList, conversationListLoadingError, isLoadingConversationList, reloadConversationList } = useActiveUserConversations();
  const { activeUser, isLoadingUserList } = useUserSession();

  if (isLoadingUserList || isLoadingConversationList) {
    return <Skeleton shape="conversation" itemCount={3} />;
  }
  if (!activeUser) {
    return <InfoMessage className="flex-1" title="No active user" description="Conversations will appear here once a user is active." />;
  }
  if (conversationListLoadingError) {
    return (
      <ErrorMessage className="flex-1" title="Couldn't load conversations" error={conversationListLoadingError} onRetry={reloadConversationList} />
    );
  }
  if (!conversationList.length) {
    return <InfoMessage className="flex-1" title="No conversations yet" description="Start one with the button above." />;
  }
  return (
    <ul className="divide-y divide-line-subtle">
      {conversationList.map((conversation) => (
        <li key={conversation.id}>
          <ConversationItem activeUserId={activeUser.id} conversation={conversation} />
        </li>
      ))}
    </ul>
  );
}

export function ConversationList() {
  const { conversationListLoadingError, isLoadingConversationList } = useActiveUserConversations();
  const { activeUser, isLoadingUserList } = useUserSession();

  const isConversationListLoaded = !isLoadingUserList && !isLoadingConversationList && !conversationListLoadingError;
  const canStartConversation = !!activeUser && isConversationListLoaded;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
        <h1 className="text-lg font-bold">Messages</h1>
        {canStartConversation ? <NewConversation activeUser={activeUser} /> : null}
      </header>

      <nav className="flex flex-1 flex-col overflow-y-auto" aria-label="Conversations">
        <ConversationListContent />
      </nav>
    </div>
  );
}
