import { type ActiveUserConversations, useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { buildUserSession, createMockedHookState } from '../../../../../test-providers';
import type { Conversation } from '../../models/conversation/conversation';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import { redirect } from 'next/navigation';
import { render, screen } from '@testing-library/react';
import { useConversationParticipant } from '../../contexts/conversation-participant/conversation-participant';
import type { User } from '../../../../core/users/models/user/user';
import { type UserSession, useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';
import { useState } from 'react';

import { ActiveUserConversationGuard } from './active-user-conversation';

vi.mock('../../hooks/use-active-user-conversations/use-active-user-conversations');
vi.mock('../../../../core/users/hooks/use-user-session/use-user-session');

let conversationPageOpeningCount = 0;

function ConversationPageStub() {
  const activeUser = useConversationParticipant();
  const [openingNumber] = useState(() => ++conversationPageOpeningCount);
  return (
    <p>
      Conversation page {openingNumber} for {activeUser.nickname}
    </p>
  );
}

describe('ActiveUserConversationGuard', () => {
  let activeUserConversation: Conversation;
  let activeUserConversations: ReturnType<typeof createMockedHookState<ActiveUserConversations>>;
  let otherActiveUserConversation: Conversation;
  let otherUserConversation: Conversation;
  let guardView: ReturnType<typeof render>;
  let userList: [User, User];
  let userSession: ReturnType<typeof createMockedHookState<UserSession>>;

  function getShownPage(): string {
    return screen.queryByRole('paragraph')?.textContent ?? '';
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    activeUserConversation = {
      id: 1,
      lastMessageTimestamp: 1625637849,
      recipientId: 2,
      recipientNickname: 'Bob',
      senderId: 1,
      senderNickname: 'Alice'
    };
    otherActiveUserConversation = {
      id: 3,
      lastMessageTimestamp: 1620284667,
      recipientId: 1,
      recipientNickname: 'Alice',
      senderId: 2,
      senderNickname: 'Bob'
    };
    otherUserConversation = {
      id: 2,
      lastMessageTimestamp: 1620284667,
      recipientId: 4,
      recipientNickname: 'Dave',
      senderId: 3,
      senderNickname: 'Carol'
    };
    const participantConversationIds = [activeUserConversation.id, otherActiveUserConversation.id];
    activeUserConversations = createMockedHookState<ActiveUserConversations>({
      conversationList: [activeUserConversation, otherActiveUserConversation],
      conversationListLoadingError: undefined,
      createConversation: vi.fn(),
      findConversationWith: vi.fn(),
      isActiveUserParticipantOfConversation: (conversationId: number) => participantConversationIds.includes(conversationId),
      isLoadingConversationList: false,
      reloadConversationList: vi.fn()
    });
    userSession = createMockedHookState(buildUserSession({ activeUser: userList[0], userList }));
    vi.mocked(useActiveUserConversations).mockImplementation(activeUserConversations.use);
    vi.mocked(useUserSession).mockImplementation(userSession.use);
    conversationPageOpeningCount = 0;
  }

  function guardConversationPage(conversationId: number) {
    return (
      <ActiveUserConversationGuard conversationId={conversationId}>
        <ConversationPageStub />
      </ActiveUserConversationGuard>
    );
  }

  function openAnotherConversation(conversationId: number): void {
    guardView.rerender(guardConversationPage(conversationId));
  }

  function openConversation(conversationId: number): void {
    guardView = render(guardConversationPage(conversationId));
  }

  beforeEach(() => {
    initMocks();
  });

  describe('When user list is still loading', () => {
    it('should wait for it to load before deciding', () => {
      userSession.set({ isLoadingUserList: true });
      openConversation(activeUserConversation.id);
      expect(getShownPage()).toBe('');
      userSession.set({ isLoadingUserList: false });
      expect(getShownPage()).toBe('Conversation page 1 for Alice');
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('When conversation list is still loading', () => {
    it('should wait for it to load before deciding', () => {
      activeUserConversations.set({ isLoadingConversationList: true });
      openConversation(activeUserConversation.id);
      expect(getShownPage()).toBe('');
      activeUserConversations.set({ isLoadingConversationList: false });
      expect(getShownPage()).toBe('Conversation page 1 for Alice');
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('When user list and conversation list are loaded', () => {
    it('should let the conversation open for the active user when the active user is a participant of the conversation', () => {
      openConversation(activeUserConversation.id);
      expect(redirect).not.toHaveBeenCalled();
      expect(getShownPage()).toBe('Conversation page 1 for Alice');
    });

    it('should redirect to the conversations when the active user is not a participant of the conversation', () => {
      openConversation(otherUserConversation.id);
      expect(redirect).toHaveBeenCalledWith(CONVERSATIONS_URL, 'replace');
      expect(getShownPage()).toBe('');
    });

    it('should redirect to the conversations when no user is active', () => {
      userSession.set({ activeUser: undefined });
      openConversation(activeUserConversation.id);
      expect(redirect).toHaveBeenCalledWith(CONVERSATIONS_URL, 'replace');
    });
  });

  describe('When a conversation is open', () => {
    beforeEach(() => {
      openConversation(activeUserConversation.id);
    });

    it('should open a new page when another conversation is opened', () => {
      expect(getShownPage()).toBe('Conversation page 1 for Alice');
      openAnotherConversation(otherActiveUserConversation.id);
      expect(getShownPage()).toBe('Conversation page 2 for Alice');
    });

    it('should open a new page for the newly active user when another participant becomes active', () => {
      expect(getShownPage()).toBe('Conversation page 1 for Alice');
      userSession.set({ activeUser: userList[1] });
      expect(getShownPage()).toBe('Conversation page 2 for Bob');
    });
  });
});
