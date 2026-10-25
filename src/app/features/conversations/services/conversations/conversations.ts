import { API_URL } from '../../../../core/config/api.config';
import type { Conversation } from '../../models/conversation/conversation';
import { getJson, postJson } from '../../../../core/http/services/http-client/http-client';
import type { NewConversation } from '../../models/new-conversation/new-conversation';

const CONVERSATIONS_API_PATH = '/conversations';

export const Conversations = {
  async createConversation(newConversation: NewConversation): Promise<Conversation> {
    const { id } = await postJson<Pick<Conversation, 'id'>>(
      `${API_URL}${CONVERSATIONS_API_PATH}/${String(newConversation.senderId)}`,
      newConversation
    );
    return { ...newConversation, id };
  },

  getConversations(userId: number): Promise<Conversation[]> {
    return getJson<Conversation[]>(`${API_URL}${CONVERSATIONS_API_PATH}/${String(userId)}`);
  }
};
