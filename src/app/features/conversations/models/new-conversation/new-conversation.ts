import type { Conversation } from '../conversation/conversation';

export type NewConversation = Omit<Conversation, 'id'>;
