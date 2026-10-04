import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from '../../models/conversation/conversation.interface';
import type { Mock } from 'vitest';
import { provideRouter } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { ConversationList } from './conversation-list';

describe('ConversationList', () => {
  let activeUserConversations: {
    conversationList: WritableSignal<Conversation[]>;
    conversationListLoadingError: WritableSignal<AppError | undefined>;
    isLoadingConversationList: WritableSignal<boolean>;
    reloadConversationList: Mock;
  };
  let conversationListElement: HTMLElement;
  let fixture: ComponentFixture<ConversationList>;
  let userSession: {
    activeUser: WritableSignal<User | undefined>;
    isLoadingUserList: WritableSignal<boolean>;
    userList: WritableSignal<User[]>;
  };

  function getContent(): string {
    fixture.detectChanges();
    return conversationListElement.querySelector('nav')!.textContent.trim();
  }

  function getNewConversationButton(): HTMLElement | null {
    fixture.detectChanges();
    return conversationListElement.querySelector('app-new-conversation');
  }

  function initMocks(): void {
    activeUserConversations = {
      conversationList: signal<Conversation[]>([]),
      conversationListLoadingError: signal<AppError | undefined>(undefined),
      isLoadingConversationList: signal(false),
      reloadConversationList: vi.fn()
    };
    userSession = {
      activeUser: signal<User | undefined>({ id: 1, nickname: 'Alice', token: 'token-1' }),
      isLoadingUserList: signal(false),
      userList: signal<User[]>([])
    };
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActiveUserConversations, useValue: activeUserConversations },
        { provide: UserSession, useValue: userSession }
      ]
    });
    fixture = TestBed.createComponent(ConversationList);
    conversationListElement = fixture.nativeElement as HTMLElement;
  });

  describe('Show conversation list of the active user', () => {
    describe('When user list or conversation list is loading', () => {
      it('should show a skeleton instead of the conversations and not let a conversation be started', () => {
        userSession.isLoadingUserList.set(true);
        expect(getContent()).toBe('');
        expect(conversationListElement.querySelector('app-skeleton')).not.toBeNull();
        expect(getNewConversationButton()).toBeNull();
        userSession.isLoadingUserList.set(false);
        activeUserConversations.isLoadingConversationList.set(true);
        expect(getContent()).toBe('');
        expect(conversationListElement.querySelector('app-skeleton')).not.toBeNull();
        expect(getNewConversationButton()).toBeNull();
      });
    });

    describe('When no user is active', () => {
      it('should show that there is no active user', () => {
        userSession.activeUser.set(undefined);
        expect(getContent()).toContain('No active user');
      });
    });

    describe('When conversation list failed to load', () => {
      it('should show the error instead of the conversations and not let a conversation be started', () => {
        expect(getContent()).not.toContain("Couldn't load conversations");
        expect(getNewConversationButton()).not.toBeNull();
        activeUserConversations.conversationListLoadingError.set(new AppError('network'));
        expect(getContent()).toContain("Couldn't load conversations");
        expect(getNewConversationButton()).toBeNull();
      });
    });

    describe('When the active user has no conversation', () => {
      it('should show that there are no conversations yet', () => {
        expect(getContent()).toContain('No conversations yet');
      });
    });

    describe('When the active user has conversations', () => {
      it('should list each conversation with the nickname of the other participant', () => {
        activeUserConversations.conversationList.set([
          { id: 2, lastMessageTimestamp: 1625637849, recipientId: 1, recipientNickname: 'Alice', senderId: 3, senderNickname: 'Carol' },
          { id: 1, lastMessageTimestamp: 1620284667, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' }
        ]);
        fixture.detectChanges();
        const conversationLinks = Array.from(conversationListElement.querySelectorAll('a'));
        expect(conversationLinks.map((conversationLink) => conversationLink.getAttribute('href'))).toEqual(['/conversations/2', '/conversations/1']);
        expect(getContent()).toContain('Carol');
        expect(getContent()).toContain('Bob');
      });
    });
  });

  describe('Reload conversation list', () => {
    describe('When conversation list failed to load', () => {
      it('should reload conversation list when trying again', () => {
        activeUserConversations.conversationListLoadingError.set(new AppError('network'));
        fixture.detectChanges();
        expect(activeUserConversations.reloadConversationList).not.toHaveBeenCalled();
        conversationListElement.querySelector<HTMLButtonElement>('app-error-message button')!.click();
        expect(activeUserConversations.reloadConversationList).toHaveBeenCalledTimes(1);
      });
    });
  });
});
