import { type ActiveUserConversations, useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { buildUserSession, renderWithProviders, waitForPendingWork } from '../../../../../test-providers';
import type { Conversation } from '../../models/conversation/conversation';
import { fireEvent } from '@testing-library/react';
import { getCurrentPathname, openUrl } from '../../../../../test-navigation';
import type { User } from '../../../../core/users/models/user/user';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

import { NewConversation } from './new-conversation';

vi.mock('../../hooks/use-active-user-conversations/use-active-user-conversations');
vi.mock('../../../../core/users/hooks/use-user-session/use-user-session');

describe('NewConversation', () => {
  let activeUserConversations: Pick<ActiveUserConversations, 'createConversation' | 'findConversationWith'>;
  let conversationCreationResponse: PromiseWithResolvers<Conversation>;
  let existingConversation: Conversation;
  let newConversationElement: HTMLElement;
  let userList: [User, User, User];

  async function chooseRecipient(recipient: User): Promise<void> {
    const recipientButtons = Array.from(newConversationElement.querySelectorAll<HTMLButtonElement>('dialog li button'));
    fireEvent.click(recipientButtons.find((recipientButton) => recipientButton.textContent.includes(recipient.nickname))!);
    await waitForPendingWork();
  }

  function getConversationRecipientDialog(): HTMLDialogElement {
    return newConversationElement.querySelector('dialog')!;
  }

  function getCurrentUrl(): string {
    return getCurrentPathname();
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' },
      { id: 3, nickname: 'Carol', token: 'token-3' }
    ];
    existingConversation = {
      id: 7,
      lastMessageTimestamp: 1625637849,
      recipientId: 2,
      recipientNickname: 'Bob',
      senderId: 1,
      senderNickname: 'Alice'
    };
    conversationCreationResponse = Promise.withResolvers<Conversation>();
    activeUserConversations = {
      createConversation: vi.fn(() => conversationCreationResponse.promise),
      findConversationWith: vi.fn((user: User) => (user.id === existingConversation.recipientId ? existingConversation : undefined))
    };
    vi.mocked(useActiveUserConversations).mockReturnValue(activeUserConversations as ActiveUserConversations);
    vi.mocked(useUserSession).mockReturnValue(buildUserSession({ activeUser: userList[0], userList }));
  }

  function openConversationRecipientDialog(): void {
    fireEvent.click(newConversationElement.querySelector('button[aria-label="New conversation"]')!);
  }

  beforeEach(() => {
    initMocks();
    openUrl('/conversations');
    newConversationElement = renderWithProviders(<NewConversation activeUser={userList[0]} />).container;
  });

  describe('Open conversation recipient dialog', () => {
    it('should list every user except the active user', () => {
      expect(getConversationRecipientDialog().open).toBe(false);
      openConversationRecipientDialog();
      expect(getConversationRecipientDialog().open).toBe(true);
      const recipientNicknames = Array.from(getConversationRecipientDialog().querySelectorAll('li'), (recipient) =>
        recipient.textContent.replace(/\s+/g, ' ').trim()
      );
      expect(recipientNicknames).toEqual(['BBob', 'CCarol']);
    });
  });

  describe('Start conversation with a recipient', () => {
    beforeEach(() => {
      openConversationRecipientDialog();
    });

    describe('When the active user already has a conversation with the recipient', () => {
      it('should open that conversation without creating any', async () => {
        expect(getCurrentUrl()).toBe('/conversations');
        await chooseRecipient(userList[1]);
        expect(activeUserConversations.createConversation).not.toHaveBeenCalled();
        expect(getConversationRecipientDialog().open).toBe(false);
        expect(getCurrentUrl()).toBe(`/conversations/${String(existingConversation.id)}`);
      });
    });

    describe('When the active user has no conversation with the recipient', () => {
      let createdConversation: Conversation;

      beforeEach(() => {
        createdConversation = {
          id: 8,
          lastMessageTimestamp: 1625659200,
          recipientId: 3,
          recipientNickname: 'Carol',
          senderId: 1,
          senderNickname: 'Alice'
        };
      });

      it('should create the conversation and open it', async () => {
        expect(activeUserConversations.createConversation).not.toHaveBeenCalled();
        await chooseRecipient(userList[2]);
        expect(activeUserConversations.createConversation).toHaveBeenCalledWith(userList[0], userList[2]);
        expect(getCurrentUrl()).toBe('/conversations');
        conversationCreationResponse.resolve(createdConversation);
        await waitForPendingWork();
        expect(getConversationRecipientDialog().open).toBe(false);
        expect(getCurrentUrl()).toBe(`/conversations/${String(createdConversation.id)}`);
      });

      it('should show the error and create the conversation again when trying again', async () => {
        await chooseRecipient(userList[2]);
        conversationCreationResponse.reject(new AppError('network'));
        conversationCreationResponse = Promise.withResolvers<Conversation>();
        await waitForPendingWork();
        expect(getConversationRecipientDialog().textContent).toContain("Couldn't create conversation");
        expect(activeUserConversations.createConversation).toHaveBeenCalledTimes(1);
        fireEvent.click(getConversationRecipientDialog().querySelector('[role="alert"] button')!);
        await waitForPendingWork();
        expect(activeUserConversations.createConversation).toHaveBeenCalledTimes(2);
        expect(activeUserConversations.createConversation).toHaveBeenLastCalledWith(userList[0], userList[2]);
      });
    });
  });
});
