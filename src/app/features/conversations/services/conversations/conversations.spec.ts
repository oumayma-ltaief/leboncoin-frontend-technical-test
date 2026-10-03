import { API_URL } from '../../../../core/config/api.config';
import { Conversation } from '../../models/conversation/conversation.interface';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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
