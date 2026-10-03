import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from '../../models/conversation/conversation.interface';
import { provideRouter } from '@angular/router';

import { ConversationItem } from './conversation-item';

describe('ConversationItem', () => {
  let conversation: Conversation;
  let fixture: ComponentFixture<ConversationItem>;

  function getContent(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent;
  }

  beforeEach(() => {
    conversation = { id: 7, lastMessageTimestamp: 1625659200, recipientId: 2, recipientNickname: 'Bob', senderId: 1, senderNickname: 'Alice' };
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    fixture = TestBed.createComponent(ConversationItem);
    fixture.componentRef.setInput('conversation', conversation);
  });

  it('should link to the conversation and show the day of its last message', () => {
    fixture.componentRef.setInput('activeUserId', conversation.senderId);
    expect(getContent()).toContain('July 7, 2021');
    expect((fixture.nativeElement as HTMLElement).querySelector('a')!.getAttribute('href')).toBe('/conversations/7');
  });

  describe('Contact nickname and conversation starter setting', () => {
    describe('When the active user is the sender of the conversation', () => {
      it('should show the nickname of the recipient and that the active user started the conversation', () => {
        fixture.componentRef.setInput('activeUserId', conversation.senderId);
        expect(getContent()).toContain(conversation.recipientNickname);
        expect(getContent()).toContain('You started this conversation');
      });
    });

    describe('When the active user is the recipient of the conversation', () => {
      it('should show the nickname of the sender and that the sender started the conversation', () => {
        fixture.componentRef.setInput('activeUserId', conversation.recipientId);
        expect(getContent()).toContain(conversation.senderNickname);
        expect(getContent()).toContain(`${conversation.senderNickname} started this conversation`);
      });
    });
  });
});
