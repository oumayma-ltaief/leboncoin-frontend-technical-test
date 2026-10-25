'use client';

import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';

export function ConversationEmpty() {
  const { conversationList } = useActiveUserConversations();

  const hasConversationToSelect = !!conversationList.length;

  return (
    <div className="flex flex-1">
      {hasConversationToSelect ? (
        <InfoMessage
          className="flex-1"
          title="Select a conversation"
          description="Choose a conversation from the list to see its messages, or create one."
        />
      ) : null}
    </div>
  );
}
