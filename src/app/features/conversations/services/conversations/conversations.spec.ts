import { API_URL } from '../../../../core/config/api.config';
import type { AppError } from '../../../../core/errors/models/app-error/app-error';
import type { Conversation } from '../../models/conversation/conversation';
import type { MockInstance } from 'vitest';
import type { NewConversation } from '../../models/new-conversation/new-conversation';

import { Conversations } from './conversations';

describe('Conversations', () => {
  let conversationList: Conversation[];
  let fetchResponse: PromiseWithResolvers<Response>;
  let fetchSpy: MockInstance<typeof fetch>;

  function initMocks(): void {
    conversationList = [{ id: 1, lastMessageTimestamp: 1625637849, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' }];
    fetchResponse = Promise.withResolvers<Response>();
  }

  beforeEach(() => {
    initMocks();
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchResponse.promise);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Create conversation', () => {
    let conversationCreationUrl: string;
    let newConversation: NewConversation;

    beforeEach(() => {
      newConversation = { lastMessageTimestamp: 1625637849, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' };
      conversationCreationUrl = `${API_URL}/conversations/${String(newConversation.senderId)}`;
    });

    it('should handle creating conversation successfully', async () => {
      const createdConversationId = 4;
      let receivedConversation: Conversation | undefined;
      const conversationCreationRequest = Conversations.createConversation(newConversation).then(
        (conversationResponse: Conversation) => (receivedConversation = conversationResponse)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        conversationCreationUrl,
        expect.objectContaining({ body: JSON.stringify(newConversation), method: 'POST' })
      );
      expect(receivedConversation).toBeUndefined();
      fetchResponse.resolve(Response.json({ id: createdConversationId }));
      await conversationCreationRequest;
      expect(receivedConversation).toEqual({ ...newConversation, id: createdConversationId });
    });

    it('should handle creating conversation with error', async () => {
      let receivedError: AppError | undefined;
      const conversationCreationRequest = Conversations.createConversation(newConversation).catch(
        (error: unknown) => (receivedError = error as AppError)
      );
      expect(fetchSpy).toHaveBeenCalledWith(conversationCreationUrl, expect.objectContaining({ method: 'POST' }));
      expect(receivedError).toBeUndefined();
      fetchResponse.resolve(new Response('Service unavailable', { status: 503, statusText: 'Service Unavailable' }));
      await conversationCreationRequest;
      expect(receivedError?.kind).toBe('unavailable');
    });
  });

  describe('Get conversations', () => {
    let conversationsUrl: string;
    let userId: number;

    beforeEach(() => {
      userId = 1;
      conversationsUrl = `${API_URL}/conversations/${String(userId)}`;
    });

    it('should handle loading conversation list successfully', async () => {
      let receivedConversationList: Conversation[] | undefined;
      const conversationsRequest = Conversations.getConversations(userId).then(
        (conversationsResponse: Conversation[]) => (receivedConversationList = conversationsResponse)
      );
      expect(fetchSpy).toHaveBeenCalledWith(conversationsUrl, expect.objectContaining({ method: 'GET' }));
      expect(receivedConversationList).toBeUndefined();
      fetchResponse.resolve(Response.json(conversationList));
      await conversationsRequest;
      expect(receivedConversationList).toEqual(conversationList);
    });

    it('should handle loading conversation list with error', async () => {
      let receivedError: AppError | undefined;
      const conversationsRequest = Conversations.getConversations(userId).catch((error: unknown) => (receivedError = error as AppError));
      expect(fetchSpy).toHaveBeenCalledWith(conversationsUrl, expect.objectContaining({ method: 'GET' }));
      expect(receivedError).toBeUndefined();
      fetchResponse.resolve(new Response('Service unavailable', { status: 503, statusText: 'Service Unavailable' }));
      await conversationsRequest;
      expect(receivedError?.kind).toBe('unavailable');
    });
  });
});
