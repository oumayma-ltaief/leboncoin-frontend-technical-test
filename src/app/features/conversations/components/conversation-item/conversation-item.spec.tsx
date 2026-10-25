import type { Conversation } from '../../models/conversation/conversation';
import { openUrl } from '../../../../../test-navigation';
import { render } from '@testing-library/react';

import { ConversationItem } from './conversation-item';

describe('ConversationItem', () => {
  let conversation: Conversation;
  let conversationItemElement: HTMLElement;

  function showConversationTo(activeUserId: number, currentUrl = '/conversations'): void {
    openUrl(currentUrl);
    conversationItemElement = render(<ConversationItem activeUserId={activeUserId} conversation={conversation} />).container;
  }

  beforeEach(() => {
    conversation = { id: 7, lastMessageTimestamp: 1625659200, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' };
  });

  it('should link to the conversation and show the day of its last message', () => {
    showConversationTo(conversation.senderId);
    expect(conversationItemElement.textContent).toContain('July 7, 2021');
    expect(conversationItemElement.querySelector('a')?.getAttribute('href')).toBe('/conversations/7');
  });

  it('should highlight the conversation when it is open', () => {
    showConversationTo(conversation.senderId, '/conversations/7');
    expect(conversationItemElement.querySelector('a')?.getAttribute('aria-current')).toBe('page');
    expect(conversationItemElement.querySelector('a')?.classList).toContain('bg-brand-soft');
  });

  describe('Contact nickname and conversation starter setting', () => {
    describe('When the active user is the sender of the conversation', () => {
      it('should show the nickname of the recipient and that the active user started the conversation', () => {
        showConversationTo(conversation.senderId);
        expect(conversationItemElement.textContent).toContain(conversation.recipientNickname);
        expect(conversationItemElement.textContent).toContain('You started this conversation');
      });
    });

    describe('When the active user is the recipient of the conversation', () => {
      it('should show the nickname of the sender and that the sender started the conversation', () => {
        showConversationTo(conversation.recipientId);
        expect(conversationItemElement.textContent).toContain(conversation.senderNickname);
        expect(conversationItemElement.textContent).toContain(`${conversation.senderNickname} started this conversation`);
      });
    });
  });
});
