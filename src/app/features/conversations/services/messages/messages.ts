import { API_URL } from '../../../../core/config/api.config';
import { getJson, postJson } from '../../../../core/http/services/http-client/http-client';
import type { Message } from '../../models/message/message';
import type { NewMessage } from '../../models/new-message/new-message';

const MESSAGES_API_PATH = '/messages';

export const Messages = {
  async createMessage(newMessage: NewMessage): Promise<Message> {
    const { id } = await postJson<Pick<Message, 'id'>>(`${API_URL}${MESSAGES_API_PATH}/${String(newMessage.conversationId)}`, newMessage);
    return { ...newMessage, id };
  },

  getMessages(conversationId: number): Promise<Message[]> {
    return getJson<Message[]>(`${API_URL}${MESSAGES_API_PATH}/${String(conversationId)}`);
  }
};
