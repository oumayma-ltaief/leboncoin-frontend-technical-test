import { ActiveUserConversationGuard } from '../../../src/app/features/conversations/guards/active-user-conversation/active-user-conversation';
import { ConversationDetail } from '../../../src/app/features/conversations/pages/conversation-detail/conversation-detail';

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const conversationId = Number((await params).conversationId);

  return (
    <ActiveUserConversationGuard conversationId={conversationId}>
      <ConversationDetail conversationId={conversationId} />
    </ActiveUserConversationGuard>
  );
}
