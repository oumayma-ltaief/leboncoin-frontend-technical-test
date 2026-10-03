import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from '../../models/conversation/conversation.interface';
import { signal, WritableSignal } from '@angular/core';

import { ConversationEmpty } from './conversation-empty';

describe('ConversationEmpty', () => {
  let conversation: Conversation;
  let conversationList: WritableSignal<Conversation[]>;
  let fixture: ComponentFixture<ConversationEmpty>;

  function getContent(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent.trim();
  }

  function initMocks(): void {
    conversation = { id: 1, lastMessageTimestamp: 1625637849, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' };
    conversationList = signal<Conversation[]>([]);
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: ActiveUserConversations, useValue: { conversationList } }]
    });
    fixture = TestBed.createComponent(ConversationEmpty);
  });

  describe('When the active user has no conversation', () => {
    it('should show nothing', () => {
      expect(getContent()).toBe('');
    });
  });

  describe('When the active user has conversations', () => {
    it('should show the message to select a conversation', () => {
      expect(getContent()).toBe('');
      conversationList.set([conversation]);
      expect(getContent()).toContain('Select a conversation');
    });
  });
});
