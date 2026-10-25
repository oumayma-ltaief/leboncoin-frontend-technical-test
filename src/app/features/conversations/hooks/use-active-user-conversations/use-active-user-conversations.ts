import type { AppError } from '../../../../core/errors/models/app-error/app-error';
import type { Conversation } from '../../models/conversation/conversation';
import { Conversations } from '../../services/conversations/conversations';
import { dateToTimestamp } from '../../../../shared/utils/date-to-timestamp/date-to-timestamp';
import { emptyListWhenNotFound } from '../../../../core/errors/utils/empty-list-when-not-found/empty-list-when-not-found';
import { isLoadingQuery } from '../../../../core/query/utils/is-loading-query/is-loading-query';
import type { NewConversation } from '../../models/new-conversation/new-conversation';
import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../../../core/users/models/user/user';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

const CONVERSATION_LIST_QUERY_KEY = 'conversations';
const NO_CONVERSATIONS: Conversation[] = [];

export interface ActiveUserConversations {
  conversationList: Conversation[];
  conversationListLoadingError: AppError | undefined;
  createConversation: (sender: User, recipient: User) => Promise<Conversation>;
  findConversationWith: (user: User) => Conversation | undefined;
  isActiveUserParticipantOfConversation: (conversationId: number) => boolean;
  isLoadingConversationList: boolean;
  reloadConversationList: () => void;
}

function buildNewConversation(sender: User, recipient: User): NewConversation {
  return {
    lastMessageTimestamp: dateToTimestamp(new Date()),
    recipientId: recipient.id,
    recipientNickname: recipient.nickname,
    senderId: sender.id,
    senderNickname: sender.nickname
  };
}

function getConversationListQueryKey(userId: number | undefined): [string, number | undefined] {
  return [CONVERSATION_LIST_QUERY_KEY, userId];
}

function sortConversationsByMostRecentMessage(conversations: Conversation[]): Conversation[] {
  return conversations.toSorted((conversation, nextConversation) => nextConversation.lastMessageTimestamp - conversation.lastMessageTimestamp);
}

export function useActiveUserConversations(): ActiveUserConversations {
  const queryClient = useQueryClient();
  const { activeUser } = useUserSession();
  const activeUserId = activeUser?.id;
  const isActiveUserKnown = activeUserId !== undefined;
  const conversationsQuery = useQuery({
    queryKey: getConversationListQueryKey(activeUserId),
    queryFn: activeUserId === undefined ? skipToken : () => emptyListWhenNotFound(Conversations.getConversations(activeUserId))
  });

  const conversationList = sortConversationsByMostRecentMessage(conversationsQuery.data ?? NO_CONVERSATIONS);

  async function createConversation(sender: User, recipient: User): Promise<Conversation> {
    const createdConversation = await Conversations.createConversation(buildNewConversation(sender, recipient));
    queryClient.setQueryData<Conversation[]>(
      getConversationListQueryKey(sender.id),
      (senderConversations) => senderConversations && [...senderConversations, createdConversation]
    );
    return createdConversation;
  }

  function findConversationWith(user: User): Conversation | undefined {
    return conversationList.find((conversation) => conversation.senderId === user.id || conversation.recipientId === user.id);
  }

  function isActiveUserParticipantOfConversation(conversationId: number): boolean {
    return conversationList.some((conversation) => conversation.id === conversationId);
  }

  function reloadConversationList(): void {
    void conversationsQuery.refetch();
  }

  return {
    conversationList,
    conversationListLoadingError: conversationsQuery.error ?? undefined,
    createConversation,
    findConversationWith,
    isActiveUserParticipantOfConversation,
    isLoadingConversationList: isLoadingQuery(conversationsQuery, isActiveUserKnown),
    reloadConversationList
  };
}
