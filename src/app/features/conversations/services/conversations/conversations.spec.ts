import { API_URL } from '../../../../core/config/api.config';
import { Conversation } from '../../models/conversation/conversation.interface';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NewConversation } from '../../models/new-conversation/new-conversation.interface';
import { TestBed } from '@angular/core/testing';

import { Conversations } from './conversations';

describe('Conversations', () => {
  let conversationList: Conversation[];
  let conversations: Conversations;
  let httpTestingController: HttpTestingController;

  function initMocks(): void {
    conversationList = [{ id: 1, lastMessageTimestamp: 1625637849, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' }];
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    conversations = TestBed.inject(Conversations);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Create conversation', () => {
    let conversationCreationUrl: string;
    let newConversation: NewConversation;

    beforeEach(() => {
      newConversation = { lastMessageTimestamp: 1625637849, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' };
      conversationCreationUrl = `${API_URL}/conversations/${newConversation.senderId}`;
    });

    it('should handle creating conversation successfully', () => {
      const createdConversationId = 4;
      let receivedConversation: Conversation | undefined;
      conversations.createConversation(newConversation).subscribe({ next: (conversationResponse) => (receivedConversation = conversationResponse) });
      const conversationCreationRequest = httpTestingController.expectOne(conversationCreationUrl);
      expect(conversationCreationRequest.request.method).toBe('POST');
      expect(conversationCreationRequest.request.body).toEqual(newConversation);
      expect(receivedConversation).toBeUndefined();
      conversationCreationRequest.flush({ id: createdConversationId });
      expect(receivedConversation).toEqual({ ...newConversation, id: createdConversationId });
    });

    it('should handle creating conversation with error', () => {
      let receivedError: HttpErrorResponse | undefined;
      conversations.createConversation(newConversation).subscribe({ error: (httpError: HttpErrorResponse) => (receivedError = httpError) });
      const conversationCreationRequest = httpTestingController.expectOne(conversationCreationUrl);
      expect(conversationCreationRequest.request.method).toBe('POST');
      expect(receivedError).toBeUndefined();
      conversationCreationRequest.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
      expect(receivedError?.status).toBe(503);
    });
  });

  describe('Get conversations', () => {
    let conversationsUrl: string;
    let userId: number;

    beforeEach(() => {
      userId = 1;
      conversationsUrl = `${API_URL}/conversations/${userId}`;
    });

    it('should handle loading conversation list successfully', () => {
      let receivedConversationList: Conversation[] | undefined;
      conversations.getConversations(userId).subscribe({ next: (conversationsResponse) => (receivedConversationList = conversationsResponse) });
      const conversationsRequest = httpTestingController.expectOne(conversationsUrl);
      expect(conversationsRequest.request.method).toBe('GET');
      expect(receivedConversationList).toBeUndefined();
      conversationsRequest.flush(conversationList);
      expect(receivedConversationList).toEqual(conversationList);
    });

    it('should handle loading conversation list with error', () => {
      let receivedError: HttpErrorResponse | undefined;
      conversations.getConversations(userId).subscribe({ error: (httpError: HttpErrorResponse) => (receivedError = httpError) });
      const conversationsRequest = httpTestingController.expectOne(conversationsUrl);
      expect(conversationsRequest.request.method).toBe('GET');
      expect(receivedError).toBeUndefined();
      conversationsRequest.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
      expect(receivedError?.status).toBe(503);
    });
  });
});
