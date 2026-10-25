import { createContext, use } from 'react';
import type { User } from '../../../../core/users/models/user/user';

const MISSING_GUARD_MESSAGE = 'The conversation participant is only available inside ActiveUserConversationGuard';

export const ConversationParticipantContext = createContext<User | undefined>(undefined);

export function useConversationParticipant(): User {
  const conversationParticipant = use(ConversationParticipantContext);
  if (!conversationParticipant) {
    throw new Error(MISSING_GUARD_MESSAGE);
  }
  return conversationParticipant;
}
