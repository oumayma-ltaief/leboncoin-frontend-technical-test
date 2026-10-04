import { Conversation } from '../conversation/conversation.interface';

export type NewConversation = Omit<Conversation, 'id'>;
