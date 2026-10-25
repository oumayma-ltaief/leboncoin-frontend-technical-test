import { ActiveUserConversationGuard } from '../../guards/active-user-conversation/active-user-conversation';
import { type ActiveUserConversations, useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { buildUserSession, createMockedHookState, renderWithProviders, waitForPendingWork } from '../../../../../test-providers';
import { fireEvent } from '@testing-library/react';
import type { Message } from '../../models/message/message';
import { Messages } from '../../services/messages/messages';
import type { User } from '../../../../core/users/models/user/user';
import { type UserSession, useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

import { ConversationDetail } from './conversation-detail';

vi.mock('../../hooks/use-active-user-conversations/use-active-user-conversations');
vi.mock('../../../../core/users/hooks/use-user-session/use-user-session');

describe('ConversationDetail', () => {
  let activeUser: User;
  let conversationDetailElement: HTMLElement;
  let conversationId: number;
  let messageList: Message[];
  let messageSendingResponse: PromiseWithResolvers<Message>;
  let messagesResponse: PromiseWithResolvers<Message[]>;
  let otherConversationId: number;
  let conversationDetailView: ReturnType<typeof renderWithProviders>;
  let userSession: ReturnType<typeof createMockedHookState<UserSession>>;

  function getContent(): string {
    return conversationDetailElement.querySelector('header + div')?.textContent.trim() ?? '';
  }

  function getContentOfSendingArea(): string {
    return conversationDetailElement.querySelector('footer')?.textContent ?? '';
  }

  function getMessageBox(): HTMLTextAreaElement {
    return conversationDetailElement.querySelector('textarea')!;
  }

  function getShownMessageBodies(): string[] {
    return Array.from(conversationDetailElement.querySelectorAll('ul[aria-label="Messages"] p'), (message) => message.textContent.trim());
  }

  function initMocks(): void {
    activeUser = { id: 1, nickname: 'Alice', token: 'token-1' };
    conversationId = 1;
    otherConversationId = 2;
    messageList = [
      { authorId: 2, body: 'Hello Alice', conversationId, id: 2, timestamp: 1625648667 },
      { authorId: 1, body: 'Hello Bob', conversationId, id: 1, timestamp: 1625637849 }
    ];
    vi.spyOn(Messages, 'getMessages').mockImplementation(() => {
      messagesResponse = Promise.withResolvers<Message[]>();
      return messagesResponse.promise;
    });
    vi.spyOn(Messages, 'createMessage').mockImplementation(() => {
      messageSendingResponse = Promise.withResolvers<Message>();
      return messageSendingResponse.promise;
    });
    userSession = createMockedHookState(buildUserSession({ activeUser, userList: [activeUser] }));
    vi.mocked(useUserSession).mockImplementation(userSession.use);
    vi.mocked(useActiveUserConversations).mockReturnValue({
      isActiveUserParticipantOfConversation: () => true,
      isLoadingConversationList: false
    } as unknown as ActiveUserConversations);
  }

  function guardConversationPage(openConversationId: number) {
    return (
      <ActiveUserConversationGuard conversationId={openConversationId}>
        <ConversationDetail conversationId={openConversationId} />
      </ActiveUserConversationGuard>
    );
  }

  async function openAnotherConversation(): Promise<void> {
    conversationDetailView.rerender(guardConversationPage(otherConversationId));
    await waitForPendingWork();
  }

  async function reopenConversation(): Promise<void> {
    conversationDetailView.rerender(guardConversationPage(conversationId));
    await waitForPendingWork();
  }

  async function sendMessage(messageBody: string): Promise<void> {
    fireEvent.change(getMessageBox(), { target: { value: messageBody } });
    fireEvent.click(conversationDetailElement.querySelector('button[aria-label="Send message"]')!);
    await waitForPendingWork();
  }

  async function serverAnswersMessageSending(answer: () => void): Promise<void> {
    answer();
    await waitForPendingWork();
  }

  async function serverFails(error: AppError = new AppError('unavailable')): Promise<void> {
    messagesResponse.reject(error);
    await waitForPendingWork();
  }

  async function serverRespondsWith(messages: Message[]): Promise<void> {
    messagesResponse.resolve(messages);
    await waitForPendingWork();
  }

  beforeEach(() => {
    initMocks();
    conversationDetailView = renderWithProviders(guardConversationPage(conversationId));
    conversationDetailElement = conversationDetailView.container;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Load message list of the conversation', () => {
    describe('When message list is loading', () => {
      it('should show a skeleton instead of the messages', () => {
        expect(Messages.getMessages).toHaveBeenCalledWith(conversationId);
        expect(getContent()).toBe('');
        expect(conversationDetailElement.querySelector('[role="status"][aria-label="Loading"]')).not.toBeNull();
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
        expect(getContent()).toContain('July 7, 2021');
      });
    });

    describe('When another conversation is opened', () => {
      it('should load message list of that conversation', async () => {
        await serverRespondsWith(messageList);
        expect(Messages.getMessages).toHaveBeenLastCalledWith(conversationId);
        await openAnotherConversation();
        expect(Messages.getMessages).toHaveBeenLastCalledWith(otherConversationId);
      });

      it('should empty the message box', async () => {
        await serverRespondsWith(messageList);
        fireEvent.change(getMessageBox(), { target: { value: 'Hello Bob' } });
        expect(getMessageBox().value).toBe('Hello Bob');
        await openAnotherConversation();
        expect(getMessageBox().value).toBe('');
      });
    });
  });

  describe('Reload message list', () => {
    describe('When message list failed to load', () => {
      it('should clear the error and show the messages when trying again', async () => {
        await serverFails();
        expect(getContent()).toContain("Couldn't load messages");
        expect(getShownMessageBodies()).toEqual([]);
        expect(Messages.getMessages).toHaveBeenCalledTimes(1);
        fireEvent.click(conversationDetailElement.querySelector('[role="alert"] button')!);
        await waitForPendingWork();
        await serverRespondsWith(messageList);
        expect(Messages.getMessages).toHaveBeenCalledTimes(2);
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
      it('should send the message written by active user dated now, show that it is being sent, and add it as the last message', async () => {
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
        expect(getContentOfSendingArea()).not.toContain('Sending…');
        await sendMessage(sentMessage.body);
        expect(Messages.createMessage).toHaveBeenCalledWith({
          authorId: activeUser.id,
          body: sentMessage.body,
          conversationId,
          timestamp: sentMessage.timestamp
        });
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
        expect(getContentOfSendingArea()).toContain('Sending…');
        await serverAnswersMessageSending(() => {
          messageSendingResponse.resolve(sentMessage);
        });
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice', 'See you tomorrow']);
        expect(getContentOfSendingArea()).not.toContain('Sending…');
      });
    });

    describe('When sending message fails', () => {
      async function sendingFails(): Promise<void> {
        await serverAnswersMessageSending(() => {
          messageSendingResponse.reject(new AppError('network'));
        });
      }

      it('should show the error and send the same message again when trying again', async () => {
        await sendMessage(sentMessage.body);
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
        await sendingFails();
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        expect(Messages.createMessage).toHaveBeenCalledTimes(1);
        fireEvent.click(conversationDetailElement.querySelector('footer [role="alert"] button')!);
        await waitForPendingWork();
        expect(Messages.createMessage).toHaveBeenCalledTimes(2);
        expect(Messages.createMessage).toHaveBeenLastCalledWith(expect.objectContaining({ body: sentMessage.body }));
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });

      it('should not let another message be sent before trying again', async () => {
        await sendMessage(sentMessage.body);
        await sendingFails();
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        expect(Messages.createMessage).toHaveBeenCalledTimes(1);
        await sendMessage('Are you still there?');
        expect(Messages.createMessage).toHaveBeenCalledTimes(1);
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
      });

      it('should no longer show the error when another user becomes active', async () => {
        const otherParticipant: User = { id: 2, nickname: 'Bob', token: 'token-2' };
        await sendMessage(sentMessage.body);
        await sendingFails();
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        userSession.set({ activeUser: otherParticipant });
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });

      it('should no longer show the error when another conversation is opened', async () => {
        await sendMessage(sentMessage.body);
        await sendingFails();
        expect(getContentOfSendingArea()).toContain("Couldn't send message");
        await openAnotherConversation();
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });
    });

    describe('When another conversation is opened before the server responds', () => {
      let otherConversationMessageList: Message[];

      beforeEach(() => {
        otherConversationMessageList = [{ authorId: 3, body: 'Hi Alice', conversationId: otherConversationId, id: 9, timestamp: 1625648667 }];
      });

      it('should let another message be sent in that conversation', async () => {
        await sendMessage(sentMessage.body);
        await openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        expect(Messages.createMessage).toHaveBeenCalledTimes(1);
        await sendMessage('Hi Carol');
        expect(Messages.createMessage).toHaveBeenCalledTimes(2);
        expect(Messages.createMessage).toHaveBeenLastCalledWith(expect.objectContaining({ body: 'Hi Carol', conversationId: otherConversationId }));
      });

      it('should keep showing that the other message is being sent when the first one is sent', async () => {
        await sendMessage(sentMessage.body);
        const firstMessageSendingResponse = messageSendingResponse;
        await openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        await sendMessage('Hi Carol');
        expect(getContentOfSendingArea()).toContain('Sending…');
        await serverAnswersMessageSending(() => {
          firstMessageSendingResponse.resolve(sentMessage);
        });
        expect(getContentOfSendingArea()).toContain('Sending…');
      });

      it('should not add the sent message to message list of that conversation', async () => {
        await sendMessage(sentMessage.body);
        await openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        expect(getShownMessageBodies()).toEqual(['Hi Alice']);
        await serverAnswersMessageSending(() => {
          messageSendingResponse.resolve(sentMessage);
        });
        expect(getShownMessageBodies()).toEqual(['Hi Alice']);
      });

      it('should not show the sending error in that conversation', async () => {
        await sendMessage(sentMessage.body);
        await openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
        await serverAnswersMessageSending(() => {
          messageSendingResponse.reject(new AppError('network'));
        });
        expect(getContentOfSendingArea()).not.toContain("Couldn't send message");
      });
    });

    describe('When the conversation is opened again before the server responds', () => {
      let firstMessageSendingResponse: PromiseWithResolvers<Message>;

      beforeEach(async () => {
        const otherConversationMessageList: Message[] = [
          { authorId: 3, body: 'Hi Alice', conversationId: otherConversationId, id: 9, timestamp: 1625648667 }
        ];
        await sendMessage(sentMessage.body);
        firstMessageSendingResponse = messageSendingResponse;
        await openAnotherConversation();
        await serverRespondsWith(otherConversationMessageList);
      });

      it('should keep message list being loaded instead of replacing it with the sent message', async () => {
        await reopenConversation();
        await serverAnswersMessageSending(() => {
          firstMessageSendingResponse.resolve(sentMessage);
        });
        await serverRespondsWith(messageList);
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice']);
      });

      it('should not show the sent message twice when reloaded message list already has it', async () => {
        await reopenConversation();
        await serverRespondsWith([...messageList, sentMessage]);
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice', 'See you tomorrow']);
        await serverAnswersMessageSending(() => {
          firstMessageSendingResponse.resolve(sentMessage);
        });
        expect(getShownMessageBodies()).toEqual(['Hello Bob', 'Hello Alice', 'See you tomorrow']);
      });
    });
  });
});
