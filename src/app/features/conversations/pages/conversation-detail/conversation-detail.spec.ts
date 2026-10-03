import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message } from '../../models/message/message.interface';
import { Messages } from '../../services/messages/messages';
import type { Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { ConversationDetail } from './conversation-detail';

describe('ConversationDetail', () => {
  let conversationDetailElement: HTMLElement;
  let conversationId: number;
  let fixture: ComponentFixture<ConversationDetail>;
  let messageList: Message[];
  let messagesResponse: Subject<Message[]>;
  let messagesService: { getMessages: Mock };
  let otherConversationId: number;

  function getContent(): string {
    fixture.detectChanges();
    return conversationDetailElement.querySelector('div')!.textContent.trim();
  }

  function getShownMessageBodies(): string[] {
    fixture.detectChanges();
    return Array.from(conversationDetailElement.querySelectorAll('app-message-item p'), (message) => message.textContent.trim());
  }

  function initMocks(): void {
    conversationId = 1;
    otherConversationId = 2;
    messageList = [
      { authorId: 2, body: 'Hello Alice', conversationId, id: 2, timestamp: 1625648667 },
      { authorId: 1, body: 'Hello Bob', conversationId, id: 1, timestamp: 1625637849 }
    ];
    messagesResponse = new Subject<Message[]>();
    messagesService = { getMessages: vi.fn(() => messagesResponse) };
  }

  function openAnotherConversation(): void {
    fixture.componentRef.setInput('id', String(otherConversationId));
    fixture.detectChanges();
  }

  async function serverFails(error: Error = new Error('Service unavailable')): Promise<void> {
    messagesResponse.error(error);
    await fixture.whenStable();
  }

  async function serverRespondsWith(messages: Message[]): Promise<void> {
    messagesResponse.next(messages);
    await fixture.whenStable();
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Messages, useValue: messagesService },
        { provide: UserSession, useValue: { activeUser: signal(undefined), userList: signal([]) } }
      ]
    });
    fixture = TestBed.createComponent(ConversationDetail);
    fixture.componentRef.setInput('id', String(conversationId));
    conversationDetailElement = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  describe('Load message list of the conversation', () => {
    describe('When message list is loading', () => {
      it('should show a skeleton instead of the messages', () => {
        expect(messagesService.getMessages).toHaveBeenCalledWith(conversationId);
        expect(getContent()).toBe('');
        expect(conversationDetailElement.querySelector('app-skeleton')).not.toBeNull();
      });
    });

    describe('When message list failed to load', () => {
      it('should show the error instead of the messages', async () => {
        expect(getContent()).not.toContain("Couldn't load messages");
        await serverFails();
        expect(getContent()).toContain("Couldn't load messages");
      });

      it('should show that there are no messages yet since no messages are found', async () => {
        await serverFails(new AppError('not-found'));
        expect(getContent()).toContain('No messages yet');
      });
    });

    describe('When the conversation has no message', () => {
      it('should show that there are no messages yet', async () => {
        await serverRespondsWith([]);
        expect(getContent()).toContain('No messages yet');
      });
    });

    describe('When the conversation has messages', () => {
      it('should list the messages with the oldest first under the date they were sent', async () => {
        await serverRespondsWith(messageList);
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
        expect(conversationDetailElement.querySelector('app-message-date-separator')).not.toBeNull();
      });
    });

    describe('When another conversation is opened', () => {
      it('should load message list of that conversation', async () => {
        await serverRespondsWith(messageList);
        expect(messagesService.getMessages).toHaveBeenLastCalledWith(conversationId);
        openAnotherConversation();
        expect(messagesService.getMessages).toHaveBeenLastCalledWith(otherConversationId);
      });
    });
  });

  describe('Reload message list', () => {
    describe('When message list failed to load', () => {
      it('should clear the error and show the messages when trying again', async () => {
        await serverFails();
        messagesResponse = new Subject<Message[]>();
        expect(getContent()).toContain("Couldn't load messages");
        expect(getShownMessageBodies()).toEqual([]);
        expect(messagesService.getMessages).toHaveBeenCalledTimes(1);
        conversationDetailElement.querySelector<HTMLButtonElement>('app-error-message button')!.click();
        fixture.detectChanges();
        await serverRespondsWith(messageList);
        expect(messagesService.getMessages).toHaveBeenCalledTimes(2);
        expect(getContent()).not.toContain("Couldn't load messages");
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
      });
    });
  });
});
