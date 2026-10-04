import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { ApplicationRef, signal, WritableSignal } from '@angular/core';
import { Conversation } from '../../models/conversation/conversation.interface';
import { Conversations } from '../conversations/conversations';
import type { Mock } from 'vitest';
import { Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { ActiveUserConversations } from './active-user-conversations';

describe('ActiveUserConversations', () => {
  let activeUser: WritableSignal<User | undefined>;
  let activeUserConversations: ActiveUserConversations;
  let conversationCreationResponse: Subject<Conversation>;
  let conversationList: Conversation[];
  let conversationsResponse: Subject<Conversation[]>;
  let conversationsService: { createConversation: Mock; getConversations: Mock };
  let userList: User[];

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' },
      { id: 4, nickname: 'Dave', token: 'token-4' }
    ];
    activeUser = signal<User | undefined>(userList[0]);
    conversationList = [
      { id: 1, lastMessageTimestamp: 1620284667, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' },
      { id: 2, lastMessageTimestamp: 1625637849, recipientId: 1, recipientNickname: 'Alice', senderId: 3, senderNickname: 'Carol' }
    ];
    conversationCreationResponse = new Subject<Conversation>();
    conversationsResponse = new Subject<Conversation[]>();
    conversationsService = {
      createConversation: vi.fn(() => conversationCreationResponse),
      getConversations: vi.fn(() => conversationsResponse)
    };
  }

  async function serverFails(error: Error = new Error('Service unavailable')): Promise<void> {
    conversationsResponse.error(error);
    await waitForLoading();
  }

  async function serverRespondsWith(conversations: Conversation[]): Promise<void> {
    conversationsResponse.next(conversations);
    await waitForLoading();
  }

  async function waitForLoading(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Conversations, useValue: conversationsService },
        { provide: UserSession, useValue: { activeUser } }
      ]
    });
    activeUserConversations = TestBed.inject(ActiveUserConversations);
    TestBed.tick();
  });

  describe('Load conversation list of the active user', () => {
    describe('When loading conversation list fails', () => {
      it('should stop loading and keep an empty list', async () => {
        expect(activeUserConversations.isLoadingConversationList()).toBe(true);
        expect(activeUserConversations.conversationList()).toEqual([]);
        await serverFails();
        expect(activeUserConversations.isLoadingConversationList()).toBe(false);
        expect(activeUserConversations.conversationList()).toEqual([]);
      });

      it('should expose the app error the loading failed with', async () => {
        const networkError = new AppError('network');
        expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
        await serverFails(networkError);
        expect(activeUserConversations.conversationListLoadingError()).toBe(networkError);
      });

      it('should expose no error since no conversations are found', async () => {
        expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
        await serverFails(new AppError('not-found'));
        expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
      });
    });

    describe('When loading conversation list succeeds', () => {
      describe('When the loaded conversation list is empty', () => {
        it('should stop loading with an empty list and no error', async () => {
          expect(activeUserConversations.isLoadingConversationList()).toBe(true);
          expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
          expect(activeUserConversations.conversationList()).toEqual([]);
          await serverRespondsWith([]);
          expect(activeUserConversations.isLoadingConversationList()).toBe(false);
          expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
          expect(activeUserConversations.conversationList()).toEqual([]);
        });
      });

      describe('When loaded conversation list is filled', () => {
        it('should stop loading and expose conversation list of the active user with the most recent conversation first', async () => {
          const [olderConversation, recentConversation] = conversationList;
          expect(activeUserConversations.isLoadingConversationList()).toBe(true);
          expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
          expect(activeUserConversations.conversationList()).toEqual([]);
          await serverRespondsWith(conversationList);
          expect(conversationsService.getConversations).toHaveBeenCalledWith(userList[0].id);
          expect(activeUserConversations.isLoadingConversationList()).toBe(false);
          expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
          expect(activeUserConversations.conversationList()).toEqual([recentConversation, olderConversation]);
        });
      });
    });
  });

  describe('Follow active user', () => {
    beforeEach(async () => {
      await serverRespondsWith(conversationList);
    });

    it('should load conversation list of the newly active user when the active user changes', () => {
      expect(conversationsService.getConversations).toHaveBeenLastCalledWith(userList[0].id);
      activeUser.set(userList[1]);
      TestBed.tick();
      expect(conversationsService.getConversations).toHaveBeenLastCalledWith(userList[1].id);
    });

    it('should stop considering the active user a participant of the conversations of the previously active user', () => {
      const [previouslyActiveUserConversation] = conversationList;
      expect(activeUserConversations.isActiveUserParticipantOfConversation(previouslyActiveUserConversation.id)).toBe(true);
      activeUser.set(userList[1]);
      TestBed.tick();
      expect(activeUserConversations.isActiveUserParticipantOfConversation(previouslyActiveUserConversation.id)).toBe(false);
    });

    it('should expose no conversations without loading any when no user is active anymore', () => {
      expect(activeUserConversations.conversationList()).toHaveLength(2);
      activeUser.set(undefined);
      TestBed.tick();
      expect(conversationsService.getConversations).toHaveBeenCalledTimes(1);
      expect(activeUserConversations.isLoadingConversationList()).toBe(false);
      expect(activeUserConversations.conversationList()).toEqual([]);
    });
  });

  describe('Check access of active user to a conversation', () => {
    beforeEach(async () => {
      await serverRespondsWith(conversationList);
    });

    describe('When the conversation is among conversation list of active user', () => {
      it('should tell that active user is a participant', () => {
        const [conversationOfActiveUser] = conversationList;
        expect(activeUserConversations.isActiveUserParticipantOfConversation(conversationOfActiveUser.id)).toBe(true);
      });
    });

    describe('When the conversation is not among conversation list of active user', () => {
      it('should tell that active user is not a participant', () => {
        const conversationIdOfOtherUsers = 99;
        expect(activeUserConversations.isActiveUserParticipantOfConversation(conversationIdOfOtherUsers)).toBe(false);
      });
    });
  });

  describe('Create conversation', () => {
    let createdConversation: Conversation;
    let creationDate: Date;
    let recipient: User;
    let sender: User;

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
      it('should create a conversation between sender and recipient dated now and add it to conversation list as the most recent one', () => {
        let receivedConversation: Conversation | undefined;
        expect(activeUserConversations.conversationList()).toHaveLength(2);
        activeUserConversations.createConversation(sender, recipient).subscribe({ next: (conversation) => (receivedConversation = conversation) });
        expect(conversationsService.createConversation).toHaveBeenCalledWith({
          lastMessageTimestamp: createdConversation.lastMessageTimestamp,
          recipientId: recipient.id,
          recipientNickname: recipient.nickname,
          senderId: sender.id,
          senderNickname: sender.nickname
        });
        expect(receivedConversation).toBeUndefined();
        conversationCreationResponse.next(createdConversation);
        expect(receivedConversation).toEqual(createdConversation);
        expect(activeUserConversations.conversationList()).toHaveLength(3);
        expect(activeUserConversations.conversationList()[0]).toEqual(createdConversation);
        expect(activeUserConversations.isActiveUserParticipantOfConversation(createdConversation.id)).toBe(true);
      });
    });

    describe('When creating conversation fails', () => {
      it('should pass the error on and leave conversation list unchanged', () => {
        const networkError = new AppError('network');
        let receivedError: unknown;
        expect(activeUserConversations.conversationList()).toHaveLength(2);
        activeUserConversations.createConversation(sender, recipient).subscribe({ error: (error: unknown) => (receivedError = error) });
        expect(receivedError).toBeUndefined();
        conversationCreationResponse.error(networkError);
        expect(receivedError).toBe(networkError);
        expect(activeUserConversations.conversationList()).toHaveLength(2);
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
        expect(activeUserConversations.findConversationWith(userWithConversation)).toEqual(existingConversation);
      });
    });

    describe('When no conversation exists between active user and another user', () => {
      it('should find no conversation', () => {
        const userWithoutConversation = userList[2];
        expect(activeUserConversations.findConversationWith(userWithoutConversation)).toBeUndefined();
      });
    });
  });

  describe('Reload conversation list', () => {
    describe('When conversation list failed to load', () => {
      beforeEach(async () => {
        await serverFails();
        conversationsResponse = new Subject<Conversation[]>();
      });

      it('should clear the error and load the conversations when conversation list is reloaded', async () => {
        expect(activeUserConversations.isLoadingConversationList()).toBe(false);
        expect(activeUserConversations.conversationListLoadingError()).toBeTruthy();
        expect(activeUserConversations.conversationList()).toEqual([]);
        activeUserConversations.reloadConversationList();
        TestBed.tick();
        await serverRespondsWith([conversationList[0]]);
        expect(activeUserConversations.isLoadingConversationList()).toBe(false);
        expect(activeUserConversations.conversationListLoadingError()).toBeUndefined();
        expect(activeUserConversations.conversationList()).toEqual([conversationList[0]]);
      });
    });
  });
});
