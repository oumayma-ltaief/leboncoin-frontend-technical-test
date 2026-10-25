import { act, renderHook, type RenderHookResult } from '@testing-library/react';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import type { Conversation } from '../../models/conversation/conversation';
import { Conversations } from '../../services/conversations/conversations';
import { createTestProviders, waitForPendingWork } from '../../../../../test-providers';
import type { User } from '../../../../core/users/models/user/user';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

import { type ActiveUserConversations, useActiveUserConversations } from './use-active-user-conversations';

vi.mock('../../../../core/users/hooks/use-user-session/use-user-session');

describe('useActiveUserConversations', () => {
  let activeUserConversations: RenderHookResult<ActiveUserConversations, unknown>;
  let activeUser: User | undefined;
  let conversationCreationResponse: PromiseWithResolvers<Conversation>;
  let conversationList: Conversation[];
  let conversationsResponse: PromiseWithResolvers<Conversation[]>;
  let userList: [User, User, User];

  function getActiveUserConversations(): ActiveUserConversations {
    return activeUserConversations.result.current;
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' },
      { id: 4, nickname: 'Dave', token: 'token-4' }
    ];
    activeUser = userList[0];
    conversationList = [
      { id: 1, lastMessageTimestamp: 1620284667, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' },
      { id: 2, lastMessageTimestamp: 1625637849, recipientId: 1, recipientNickname: 'Alice', senderId: 3, senderNickname: 'Carol' }
    ];
    conversationCreationResponse = Promise.withResolvers<Conversation>();
    conversationsResponse = Promise.withResolvers<Conversation[]>();
    vi.spyOn(Conversations, 'createConversation').mockImplementation(() => conversationCreationResponse.promise);
    vi.spyOn(Conversations, 'getConversations').mockImplementation(() => conversationsResponse.promise);
    vi.mocked(useUserSession).mockImplementation(() => ({
      activeUser,
      isLoadingUserList: false,
      reloadUserList: vi.fn(),
      setActiveUser: vi.fn(),
      userList,
      userListLoadingError: undefined
    }));
  }

  async function serverFails(error: AppError = new AppError('unavailable')): Promise<void> {
    conversationsResponse.reject(error);
    await waitForLoading();
  }

  async function serverRespondsWith(conversations: Conversation[]): Promise<void> {
    conversationsResponse.resolve(conversations);
    await waitForLoading();
  }

  async function switchActiveUser(newlyActiveUser: User | undefined): Promise<void> {
    activeUser = newlyActiveUser;
    conversationsResponse = Promise.withResolvers<Conversation[]>();
    activeUserConversations.rerender();
    await waitForLoading();
  }

  async function waitForLoading(): Promise<void> {
    await waitForPendingWork();
  }

  beforeEach(() => {
    initMocks();
    activeUserConversations = renderHook(() => useActiveUserConversations(), { wrapper: createTestProviders() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Load conversation list of the active user', () => {
    describe('When loading conversation list fails', () => {
      it('should stop loading and keep an empty list', async () => {
        expect(getActiveUserConversations().isLoadingConversationList).toBe(true);
        expect(getActiveUserConversations().conversationList).toEqual([]);
        await serverFails();
        expect(getActiveUserConversations().isLoadingConversationList).toBe(false);
        expect(getActiveUserConversations().conversationList).toEqual([]);
      });

      it('should expose the app error the loading failed with', async () => {
        const networkError = new AppError('network');
        expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
        await serverFails(networkError);
        expect(getActiveUserConversations().conversationListLoadingError).toBe(networkError);
      });

      it('should expose no error since no conversations are found', async () => {
        expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
        await serverFails(new AppError('not-found'));
        expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
      });
    });

    describe('When loading conversation list succeeds', () => {
      describe('When the loaded conversation list is empty', () => {
        it('should stop loading with an empty list and no error', async () => {
          expect(getActiveUserConversations().isLoadingConversationList).toBe(true);
          expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
          expect(getActiveUserConversations().conversationList).toEqual([]);
          await serverRespondsWith([]);
          expect(getActiveUserConversations().isLoadingConversationList).toBe(false);
          expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
          expect(getActiveUserConversations().conversationList).toEqual([]);
        });
      });

      describe('When loaded conversation list is filled', () => {
        it('should stop loading and expose conversation list of the active user with the most recent conversation first', async () => {
          const [olderConversation, recentConversation] = conversationList;
          expect(getActiveUserConversations().isLoadingConversationList).toBe(true);
          expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
          expect(getActiveUserConversations().conversationList).toEqual([]);
          await serverRespondsWith(conversationList);
          expect(Conversations.getConversations).toHaveBeenCalledWith(userList[0].id);
          expect(getActiveUserConversations().isLoadingConversationList).toBe(false);
          expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
          expect(getActiveUserConversations().conversationList).toEqual([recentConversation, olderConversation]);
        });
      });
    });
  });

  describe('Follow active user', () => {
    beforeEach(async () => {
      await serverRespondsWith(conversationList);
    });

    it('should load conversation list of the newly active user when the active user changes', async () => {
      expect(Conversations.getConversations).toHaveBeenLastCalledWith(userList[0].id);
      await switchActiveUser(userList[1]);
      expect(Conversations.getConversations).toHaveBeenLastCalledWith(userList[1].id);
    });

    it('should stop considering the active user a participant of the conversations of the previously active user', async () => {
      const [previouslyActiveUserConversation] = conversationList as [Conversation];
      expect(getActiveUserConversations().isActiveUserParticipantOfConversation(previouslyActiveUserConversation.id)).toBe(true);
      await switchActiveUser(userList[1]);
      expect(getActiveUserConversations().isActiveUserParticipantOfConversation(previouslyActiveUserConversation.id)).toBe(false);
    });

    it('should expose no conversations without loading any when no user is active anymore', async () => {
      expect(getActiveUserConversations().conversationList).toHaveLength(2);
      await switchActiveUser(undefined);
      expect(Conversations.getConversations).toHaveBeenCalledTimes(1);
      expect(getActiveUserConversations().isLoadingConversationList).toBe(false);
      expect(getActiveUserConversations().conversationList).toEqual([]);
    });
  });

  describe('Check access of active user to a conversation', () => {
    beforeEach(async () => {
      await serverRespondsWith(conversationList);
    });

    describe('When the conversation is among conversation list of active user', () => {
      it('should tell that active user is a participant', () => {
        const [conversationOfActiveUser] = conversationList as [Conversation];
        expect(getActiveUserConversations().isActiveUserParticipantOfConversation(conversationOfActiveUser.id)).toBe(true);
      });
    });

    describe('When the conversation is not among conversation list of active user', () => {
      it('should tell that active user is not a participant', () => {
        const conversationIdOfOtherUsers = 99;
        expect(getActiveUserConversations().isActiveUserParticipantOfConversation(conversationIdOfOtherUsers)).toBe(false);
      });
    });
  });

  describe('Create conversation', () => {
    let createdConversation: Conversation;
    let creationDate: Date;
    let recipient: User;
    let sender: User;

    function createConversation(): { getReceivedConversation: () => Conversation | undefined; getReceivedError: () => unknown } {
      let receivedConversation: Conversation | undefined;
      let receivedError: unknown;
      act(() => {
        getActiveUserConversations()
          .createConversation(sender, recipient)
          .then(
            (conversation) => (receivedConversation = conversation),
            (error: unknown) => (receivedError = error)
          );
      });
      return { getReceivedConversation: () => receivedConversation, getReceivedError: () => receivedError };
    }

    beforeEach(async () => {
      creationDate = new Date('2026-06-15T12:00:00Z');
      vi.useFakeTimers({ now: creationDate, toFake: ['Date'] });
      [sender, , recipient] = userList;
      createdConversation = {
        id: 9,
        lastMessageTimestamp: 1781524800,
        recipientId: recipient.id,
        recipientNickname: recipient.nickname,
        senderId: sender.id,
        senderNickname: sender.nickname
      };
      await serverRespondsWith(conversationList);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe('When creating conversation succeeds', () => {
      it('should create a conversation between sender and recipient dated now and add it to conversation list as the most recent one', async () => {
        expect(getActiveUserConversations().conversationList).toHaveLength(2);
        const conversationCreation = createConversation();
        expect(Conversations.createConversation).toHaveBeenCalledWith({
          lastMessageTimestamp: createdConversation.lastMessageTimestamp,
          recipientId: recipient.id,
          recipientNickname: recipient.nickname,
          senderId: sender.id,
          senderNickname: sender.nickname
        });
        expect(conversationCreation.getReceivedConversation()).toBeUndefined();
        conversationCreationResponse.resolve(createdConversation);
        await waitForPendingWork();
        expect(conversationCreation.getReceivedConversation()).toEqual(createdConversation);
        expect(getActiveUserConversations().conversationList).toHaveLength(3);
        expect(getActiveUserConversations().conversationList[0]).toEqual(createdConversation);
        expect(getActiveUserConversations().isActiveUserParticipantOfConversation(createdConversation.id)).toBe(true);
      });
    });

    describe('When creating conversation fails', () => {
      it('should pass the error on and leave conversation list unchanged', async () => {
        const networkError = new AppError('network');
        expect(getActiveUserConversations().conversationList).toHaveLength(2);
        const conversationCreation = createConversation();
        expect(conversationCreation.getReceivedError()).toBeUndefined();
        conversationCreationResponse.reject(networkError);
        await waitForPendingWork();
        expect(conversationCreation.getReceivedError()).toBe(networkError);
        expect(getActiveUserConversations().conversationList).toHaveLength(2);
      });
    });

    describe('When another user becomes active before the server responds', () => {
      it('should not add the created conversation to conversation list of the newly active user', async () => {
        const newlyActiveUserConversationList = [conversationList[0]!];
        createConversation();
        await switchActiveUser(userList[1]);
        await serverRespondsWith(newlyActiveUserConversationList);
        expect(getActiveUserConversations().conversationList).toEqual(newlyActiveUserConversationList);
        conversationCreationResponse.resolve(createdConversation);
        await waitForPendingWork();
        expect(getActiveUserConversations().conversationList).toEqual(newlyActiveUserConversationList);
      });
    });
  });

  describe('Find conversation with a user', () => {
    beforeEach(async () => {
      await serverRespondsWith(conversationList);
    });

    describe('When a conversation exists between active user and another user', () => {
      it('should find the existing conversation', () => {
        const userWithConversation = userList[1];
        const [existingConversation] = conversationList;
        expect(getActiveUserConversations().findConversationWith(userWithConversation)).toEqual(existingConversation);
      });
    });

    describe('When no conversation exists between active user and another user', () => {
      it('should find no conversation', () => {
        const userWithoutConversation = userList[2];
        expect(getActiveUserConversations().findConversationWith(userWithoutConversation)).toBeUndefined();
      });
    });
  });

  describe('Reload conversation list', () => {
    describe('When conversation list failed to load', () => {
      beforeEach(async () => {
        await serverFails();
        conversationsResponse = Promise.withResolvers<Conversation[]>();
      });

      it('should clear the error and load the conversations when conversation list is reloaded', async () => {
        const reloadedConversationList = [conversationList[0]!];
        expect(getActiveUserConversations().isLoadingConversationList).toBe(false);
        expect(getActiveUserConversations().conversationListLoadingError).toBeTruthy();
        expect(getActiveUserConversations().conversationList).toEqual([]);
        act(() => {
          getActiveUserConversations().reloadConversationList();
        });
        await serverRespondsWith(reloadedConversationList);
        expect(getActiveUserConversations().isLoadingConversationList).toBe(false);
        expect(getActiveUserConversations().conversationListLoadingError).toBeUndefined();
        expect(getActiveUserConversations().conversationList).toEqual(reloadedConversationList);
      });
    });
  });
});
