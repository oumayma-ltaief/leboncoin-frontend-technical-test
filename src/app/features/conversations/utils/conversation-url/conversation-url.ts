import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';

export function getConversationUrl(conversationId: number): string {
  return `${CONVERSATIONS_URL}/${String(conversationId)}`;
}
