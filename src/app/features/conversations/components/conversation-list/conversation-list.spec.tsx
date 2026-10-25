import { type ActiveUserConversations, useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { buildUserSession, createMockedHookState, renderWithProviders } from '../../../../../test-providers';
import { fireEvent, screen } from '@testing-library/react';
import { type UserSession, useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

import { ConversationList } from './conversation-list';

vi.mock('../../hooks/use-active-user-conversations/use-active-user-conversations');
vi.mock('../../../../core/users/hooks/use-user-session/use-user-session');

describe('ConversationList', () => {
  let activeUserConversations: ReturnType<typeof createMockedHookState<ActiveUserConversations>>;
  let conversationListElement: HTMLElement;
  let userSession: ReturnType<typeof createMockedHookState<UserSession>>;

  function getContent(): string {
    return conversationListElement.querySelector('nav')?.textContent.trim() ?? '';
  }

  function getNewConversationButton(): HTMLElement | null {
    return screen.queryByRole('button', { name: 'New conversation' });
  }

  function initMocks(): void {
    activeUserConversations = createMockedHookState<ActiveUserConversations>({
      conversationList: [],
      conversationListLoadingError: undefined,
      createConversation: vi.fn(),
      findConversationWith: vi.fn(),
      isActiveUserParticipantOfConversation: vi.fn(),
      isLoadingConversationList: false,
      reloadConversationList: vi.fn()
    });
    userSession = createMockedHookState(buildUserSession({ activeUser: { id: 1, nickname: 'Alice', token: 'token-1' } }));
    vi.mocked(useActiveUserConversations).mockImplementation(activeUserConversations.use);
    vi.mocked(useUserSession).mockImplementation(userSession.use);
  }

  beforeEach(() => {
    initMocks();
    conversationListElement = renderWithProviders(<ConversationList />).container;
  });

  describe('Show conversation list of the active user', () => {
    describe('When user list or conversation list is loading', () => {
      it('should show a skeleton instead of the conversations and not let a conversation be started', () => {
        userSession.set({ isLoadingUserList: true });
        expect(getContent()).toBe('');
        expect(screen.getByRole('status', { name: 'Loading' })).not.toBeNull();
        expect(getNewConversationButton()).toBeNull();
        userSession.set({ isLoadingUserList: false });
        activeUserConversations.set({ isLoadingConversationList: true });
        expect(getContent()).toBe('');
        expect(screen.getByRole('status', { name: 'Loading' })).not.toBeNull();
        expect(getNewConversationButton()).toBeNull();
      });
    });

    describe('When no user is active', () => {
      it('should show that there is no active user', () => {
        userSession.set({ activeUser: undefined });
        expect(getContent()).toContain('No active user');
      });
    });

    describe('When conversation list failed to load', () => {
      it('should show the error instead of the conversations and not let a conversation be started', () => {
        expect(getContent()).not.toContain("Couldn't load conversations");
        expect(getNewConversationButton()).not.toBeNull();
        activeUserConversations.set({ conversationListLoadingError: new AppError('network') });
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
        activeUserConversations.set({
          conversationList: [
            { id: 2, lastMessageTimestamp: 1625637849, recipientId: 1, recipientNickname: 'Alice', senderId: 3, senderNickname: 'Carol' },
            { id: 1, lastMessageTimestamp: 1620284667, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' }
          ]
        });
        const conversationLinks = Array.from(conversationListElement.querySelectorAll('nav a'));
        expect(conversationLinks.map((conversationLink) => conversationLink.getAttribute('href'))).toEqual(['/conversations/2', '/conversations/1']);
        expect(getContent()).toContain('Carol');
        expect(getContent()).toContain('Bob');
      });
    });
  });

  describe('Reload conversation list', () => {
    describe('When conversation list failed to load', () => {
      it('should reload conversation list when trying again', () => {
        activeUserConversations.set({ conversationListLoadingError: new AppError('network') });
        expect(activeUserConversations.current().reloadConversationList).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(activeUserConversations.current().reloadConversationList).toHaveBeenCalledTimes(1);
      });
    });
  });
});
