import { API_URL } from '../../../../core/config/api.config';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Message } from '../../models/message/message.interface';
import { TestBed } from '@angular/core/testing';

import { Messages } from './messages';

describe('Messages', () => {
  let httpTestingController: HttpTestingController;
  let messageList: Message[];
  let messages: Messages;

  function initMocks(): void {
    messageList = [{ authorId: 1, body: 'Hello Bob', conversationId: 1, id: 1, timestamp: 1625637849 }];
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    messages = TestBed.inject(Messages);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Get messages', () => {
    let conversationId: number;
    let messagesUrl: string;

    beforeEach(() => {
      conversationId = 1;
      messagesUrl = `${API_URL}/messages/${conversationId}`;
    });

    it('should handle loading message list successfully', () => {
      let receivedMessageList: Message[] | undefined;
      messages.getMessages(conversationId).subscribe({ next: (messagesResponse) => (receivedMessageList = messagesResponse) });
      const messagesRequest = httpTestingController.expectOne(messagesUrl);
      expect(messagesRequest.request.method).toBe('GET');
      expect(receivedMessageList).toBeUndefined();
      messagesRequest.flush(messageList);
      expect(receivedMessageList).toEqual(messageList);
    });

    it('should handle loading message list with error', () => {
      let receivedError: HttpErrorResponse | undefined;
      messages.getMessages(conversationId).subscribe({ error: (httpError: HttpErrorResponse) => (receivedError = httpError) });
      const messagesRequest = httpTestingController.expectOne(messagesUrl);
      expect(messagesRequest.request.method).toBe('GET');
      expect(receivedError).toBeUndefined();
      messagesRequest.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
      expect(receivedError?.status).toBe(503);
    });
  });
});
