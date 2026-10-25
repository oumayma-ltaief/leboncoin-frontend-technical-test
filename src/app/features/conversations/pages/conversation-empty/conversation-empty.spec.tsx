import { type ActiveUserConversations, useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import type { Conversation } from '../../models/conversation/conversation';
import { createMockedHookState } from '../../../../../test-providers';
import { render } from '@testing-library/react';

import { ConversationEmpty } from './conversation-empty';

vi.mock('../../hooks/use-active-user-conversations/use-active-user-conversations');

describe('ConversationEmpty', () => {
  let activeUserConversations: ReturnType<typeof createMockedHookState<Pick<ActiveUserConversations, 'conversationList'>>>;
  let conversation: Conversation;
  let conversationEmptyElement: HTMLElement;

  function initMocks(): void {
    conversation = { id: 1, lastMessageTimestamp: 1625637849, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' };
    activeUserConversations = createMockedHookState({ conversationList: [] as Conversation[] });
    vi.mocked(useActiveUserConversations).mockImplementation(activeUserConversations.use as () => ActiveUserConversations);
  }

  beforeEach(() => {
    initMocks();
    conversationEmptyElement = render(<ConversationEmpty />).container;
  });

  describe('When the active user has no conversation', () => {
    it('should show nothing', () => {
      expect(conversationEmptyElement.textContent.trim()).toBe('');
    });
  });

  describe('When the active user has conversations', () => {
    it('should show the message to select a conversation', () => {
      expect(conversationEmptyElement.textContent.trim()).toBe('');
      activeUserConversations.set({ conversationList: [conversation] });
      expect(conversationEmptyElement.textContent).toContain('Select a conversation');
    });
  });
});
