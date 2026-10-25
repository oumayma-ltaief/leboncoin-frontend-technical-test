import { openUrl } from '../../../../../test-navigation';
import { render } from '@testing-library/react';

import { ConversationsLayout } from './conversations-layout';

vi.mock('../../components/conversation-list/conversation-list', () => ({ ConversationList: () => null }));

const CONVERSATION_LIST_SELECTOR = 'aside';
const CONVERSATION_PANEL_SELECTOR = 'section[aria-label="Conversation"]';

describe('ConversationsLayout', () => {
  let conversationsLayoutElement: HTMLElement;

  function closeConversation(): void {
    openUrl('/conversations');
  }

  function isElementVisible(elementSelector: string): boolean {
    const element = conversationsLayoutElement.querySelector(elementSelector);
    return !!element?.classList.contains('flex') && !element.classList.contains('hidden');
  }

  function openConversation(): void {
    openUrl('/conversations/1', { conversationId: '1' });
  }

  function showLayout(): void {
    conversationsLayoutElement = render(<ConversationsLayout>Conversation page</ConversationsLayout>).container;
  }

  describe('When no conversation is open', () => {
    beforeEach(() => {
      closeConversation();
      showLayout();
    });

    it('should hide conversation list when a conversation is opened', () => {
      expect(isElementVisible(CONVERSATION_LIST_SELECTOR)).toBe(true);
      openConversation();
      expect(isElementVisible(CONVERSATION_LIST_SELECTOR)).toBe(false);
    });

    it('should show the conversation panel when a conversation is opened', () => {
      expect(isElementVisible(CONVERSATION_PANEL_SELECTOR)).toBe(false);
      openConversation();
      expect(isElementVisible(CONVERSATION_PANEL_SELECTOR)).toBe(true);
    });
  });

  describe('When a conversation is open', () => {
    beforeEach(() => {
      openConversation();
      showLayout();
    });

    it('should show conversation list when the conversation is closed', () => {
      expect(isElementVisible(CONVERSATION_LIST_SELECTOR)).toBe(false);
      closeConversation();
      expect(isElementVisible(CONVERSATION_LIST_SELECTOR)).toBe(true);
    });

    it('should hide the conversation panel when the conversation is closed', () => {
      expect(isElementVisible(CONVERSATION_PANEL_SELECTOR)).toBe(true);
      closeConversation();
      expect(isElementVisible(CONVERSATION_PANEL_SELECTOR)).toBe(false);
    });
  });
});
