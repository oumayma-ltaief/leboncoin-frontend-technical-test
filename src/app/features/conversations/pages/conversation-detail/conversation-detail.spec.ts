import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message } from '../../models/message/message.interface';
import { Messages } from '../../services/messages/messages';
import type { Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { ConversationDetail } from './conversation-detail';

describe('ConversationDetail', () => {
  let activeUser: User;
  let conversationDetailElement: HTMLElement;
  let conversationId: number;
  let fixture: ComponentFixture<ConversationDetail>;
  let messageList: Message[];
  let messageSendingResponse: Subject<Message>;
  let messagesResponse: Subject<Message[]>;
  let messagesService: { createMessage: Mock; getMessages: Mock };
  let otherConversationId: number;
  let userSession: { activeUser: WritableSignal<User>; userList: WritableSignal<User[]> };

  function getContent(): string {
    fixture.detectChanges();
    return conversationDetailElement.querySelector('div')!.textContent.trim();
  }

  function getContentOfSendingArea(): string {
    fixture.detectChanges();
    return conversationDetailElement.querySelector('footer')!.textContent;
  }

  function getShownMessageBodies(): string[] {
    fixture.detectChanges();
    return Array.from(conversationDetailElement.querySelectorAll('app-message-item p'), (message) => message.textContent.trim());
  }

  function initMocks(): void {
    activeUser = { id: 1, nickname: 'Alice', token: 'token-1' };
    userSession = { activeUser: signal(activeUser), userList: signal([activeUser]) };
    conversationId = 1;
    otherConversationId = 2;
    messageList = [
      { authorId: 2, body: 'Hello Alice', conversationId, id: 2, timestamp: 1625648667 },
      { authorId: 1, body: 'Hello Bob', conversationId, id: 1, timestamp: 1625637849 }
    ];
    messagesResponse = new Subject<Message[]>();
    messageSendingResponse = new Subject<Message>();
    messagesService = { createMessage: vi.fn(() => messageSendingResponse), getMessages: vi.fn(() => messagesResponse) };
  }

  function openAnotherConversation(): void {
    fixture.componentRef.setInput('id', String(otherConversationId));
    fixture.detectChanges();
  }

  function reopenConversation(): void {
    fixture.componentRef.setInput('id', String(conversationId));
    fixture.detectChanges();
  }

  function sendMessage(messageBody: string): void {
    const messageBox = conversationDetailElement.querySelector('textarea')!;
    messageBox.value = messageBody;
    messageBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    conversationDetailElement.querySelector<HTMLButtonElement>('button[aria-label="Send message"]')!.click();
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
      providers: [provideRouter([]), { provide: Messages, useValue: messagesService }, { provide: UserSession, useValue: userSession }]
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

  describe('Send message', () => {
    let messageSendingDate: Date;
    let sentMessage: Message;

    beforeEach(async () => {
      messageSendingDate = new Date('2026-06-15T12:00:00Z');
      vi.useFakeTimers({ now: messageSendingDate, toFake: ['Date'] });
      sentMessage = { authorId: activeUser.id, body: 'See you tomorrow', conversationId, id: 3, timestamp: 1781524800 };
      await serverRespondsWith(messageList);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('When sending message succeeds', () => {
      it('should send the message written by active user dated now, show that it is being sent, and add it as the last message', () => {
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
        expect(getContentOfSendingArea()).not.toContain('Sending…');
        sendMessage(sentMessage.body);
        expect(messagesService.createMessage).toHaveBeenCalledWith({
          authorId: activeUser.id,
          body: sentMessage.body,
          conversationId,
          timestamp: sentMessage.timestamp
        });
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
        expect(getContentOfSendingArea()).toContain('Sending…');
        messageSendingResponse.next(sentMessage);
        messageSendingResponse.complete();
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice', 'See you tomorrow']);
        expect(getContentOfSendingArea()).not.toContain('Sending…');
      });
    });

    describe('When sending message fails', () => {
      it('should show the error and send the same message again when trying again', () => {
        sendMessage(sentMessage.body);
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
        messageSendingResponse.error(new AppError('network'));
        messageSendingResponse = new Subject<Message>();
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        expect(messagesService.createMessage).toHaveBeenCalledTimes(1);
        conversationDetailElement.querySelector<HTMLButtonElement>('app-error-message button')!.click();
        expect(messagesService.createMessage).toHaveBeenCalledTimes(2);
        expect(messagesService.createMessage).toHaveBeenLastCalledWith(expect.objectContaining({ body: sentMessage.body }));
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });

      it('should not let another message be sent before trying again', () => {
        sendMessage(sentMessage.body);
        messageSendingResponse.error(new AppError('network'));
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        expect(messagesService.createMessage).toHaveBeenCalledTimes(1);
        sendMessage('Are you still there?');
        expect(messagesService.createMessage).toHaveBeenCalledTimes(1);
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
      });

      it('should no longer show the error when another user becomes active', () => {
        const otherParticipant: User = { id: 2, nickname: 'Bob', token: 'token-2' };
        sendMessage(sentMessage.body);
        messageSendingResponse.error(new AppError('network'));
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        userSession.activeUser.set(otherParticipant);
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });

      it('should no longer show the error when another conversation is opened', () => {
        sendMessage(sentMessage.body);
        messageSendingResponse.error(new AppError('network'));
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        openAnotherConversation();
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });
    });

    describe('When another conversation is opened before the server responds', () => {
      let otherConversationMessageList: Message[];

      beforeEach(() => {
        otherConversationMessageList = [{ authorId: 3, body: 'Hi Alice', conversationId: otherConversationId, id: 9, timestamp: 1625648667 }];
      });

      it('should let another message be sent in that conversation', async () => {
        sendMessage(sentMessage.body);
        openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        expect(messagesService.createMessage).toHaveBeenCalledTimes(1);
        sendMessage('Hi Carol');
        expect(messagesService.createMessage).toHaveBeenCalledTimes(2);
        expect(messagesService.createMessage).toHaveBeenLastCalledWith(
          expect.objectContaining({ body: 'Hi Carol', conversationId: otherConversationId })
        );
      });

      it('should keep showing that the other message is being sent when the first one is sent', async () => {
        const firstMessageSendingResponse = messageSendingResponse;
        sendMessage(sentMessage.body);
        openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        messageSendingResponse = new Subject<Message>();
        sendMessage('Hi Carol');
        expect(getContentOfSendingArea()).toContain('Sending…');
        firstMessageSendingResponse.next(sentMessage);
        firstMessageSendingResponse.complete();
        expect(getContentOfSendingArea()).toContain('Sending…');
      });

      it('should not add the sent message to message list of that conversation', async () => {
        sendMessage(sentMessage.body);
        openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        expect(getShownMessageBodies()).toEqual(['Hi Alice']);
        messageSendingResponse.next(sentMessage);
        expect(getShownMessageBodies()).toEqual(['Hi Alice']);
      });

      it('should not show the sending error in that conversation', async () => {
        sendMessage(sentMessage.body);
        openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
        messageSendingResponse.error(new AppError('network'));
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });
    });

    describe('When the conversation is opened again before the server responds', () => {
      beforeEach(async () => {
        const otherConversationMessageList: Message[] = [
          { authorId: 3, body: 'Hi Alice', conversationId: otherConversationId, id: 9, timestamp: 1625648667 }
        ];
        sendMessage(sentMessage.body);
        openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
      });

      it('should keep message list being loaded instead of replacing it with the sent message', async () => {
        reopenConversation();
        messageSendingResponse.next(sentMessage);
        messageSendingResponse.complete();
        await serverRespondsWith(messageList);
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
      });

      it('should not show the sent message twice when reloaded message list already has it', async () => {
        reopenConversation();
        await serverRespondsWith([...messageList, sentMessage]);
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice', 'See you tomorrow']);
        messageSendingResponse.next(sentMessage);
        messageSendingResponse.complete();
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice', 'See you tomorrow']);
      });
    });
  });
});
