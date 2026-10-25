import { API_URL } from '../../../../core/config/api.config';
import type { AppError } from '../../../../core/errors/models/app-error/app-error';
import type { Message } from '../../models/message/message';
import type { MockInstance } from 'vitest';
import type { NewMessage } from '../../models/new-message/new-message';

import { Messages } from './messages';

describe('Messages', () => {
  let fetchResponse: PromiseWithResolvers<Response>;
  let fetchSpy: MockInstance<typeof fetch>;
  let messageList: Message[];

  function initMocks(): void {
    messageList = [{ authorId: 1, body: 'Hello Bob', conversationId: 1, id: 1, timestamp: 1625637849 }];
    fetchResponse = Promise.withResolvers<Response>();
  }

  beforeEach(() => {
    initMocks();
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchResponse.promise);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Create message', () => {
    let messageCreationUrl: string;
    let newMessage: NewMessage;

    beforeEach(() => {
      newMessage = { authorId: 1, body: 'Hello Bob', conversationId: 1, timestamp: 1625637849 };
      messageCreationUrl = `${API_URL}/messages/${String(newMessage.conversationId)}`;
    });

    it('should handle creating message successfully', async () => {
      const createdMessageId = 4;
      let receivedMessage: Message | undefined;
      const messageCreationRequest = Messages.createMessage(newMessage).then((messageResponse: Message) => (receivedMessage = messageResponse));
      expect(fetchSpy).toHaveBeenCalledWith(messageCreationUrl, expect.objectContaining({ body: JSON.stringify(newMessage), method: 'POST' }));
      expect(receivedMessage).toBeUndefined();
      fetchResponse.resolve(Response.json({ id: createdMessageId }));
      await messageCreationRequest;
      expect(receivedMessage).toEqual({ ...newMessage, id: createdMessageId });
    });

    it('should handle creating message with error', async () => {
      let receivedError: AppError | undefined;
      const messageCreationRequest = Messages.createMessage(newMessage).catch((error: unknown) => (receivedError = error as AppError));
      expect(fetchSpy).toHaveBeenCalledWith(messageCreationUrl, expect.objectContaining({ method: 'POST' }));
      expect(receivedError).toBeUndefined();
      fetchResponse.resolve(new Response('Service unavailable', { status: 503, statusText: 'Service Unavailable' }));
      await messageCreationRequest;
      expect(receivedError?.kind).toBe('unavailable');
    });
  });

  describe('Get messages', () => {
    let conversationId: number;
    let messagesUrl: string;

    beforeEach(() => {
      conversationId = 1;
      messagesUrl = `${API_URL}/messages/${String(conversationId)}`;
    });

    it('should handle loading message list successfully', async () => {
      let receivedMessageList: Message[] | undefined;
      const messagesRequest = Messages.getMessages(conversationId).then((messagesResponse: Message[]) => (receivedMessageList = messagesResponse));
      expect(fetchSpy).toHaveBeenCalledWith(messagesUrl, expect.objectContaining({ method: 'GET' }));
      expect(receivedMessageList).toBeUndefined();
      fetchResponse.resolve(Response.json(messageList));
      await messagesRequest;
      expect(receivedMessageList).toEqual(messageList);
    });

    it('should handle loading message list with error', async () => {
      let receivedError: AppError | undefined;
      const messagesRequest = Messages.getMessages(conversationId).catch((error: unknown) => (receivedError = error as AppError));
      expect(fetchSpy).toHaveBeenCalledWith(messagesUrl, expect.objectContaining({ method: 'GET' }));
      expect(receivedError).toBeUndefined();
      fetchResponse.resolve(new Response('Service unavailable', { status: 503, statusText: 'Service Unavailable' }));
      await messagesRequest;
      expect(receivedError?.kind).toBe('unavailable');
    });
  });
});
