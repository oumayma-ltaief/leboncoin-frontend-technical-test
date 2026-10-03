import { ComponentFixture, TestBed } from '@angular/core/testing';
import { formatDate } from '@angular/common';
import { Message } from '../../models/message/message.interface';
import { signal } from '@angular/core';
import { timestampToDate } from '../../../../shared/utils/timestamp-to-date/timestamp-to-date';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { MessageItem } from './message-item';

describe('MessageItem', () => {
  let fixture: ComponentFixture<MessageItem>;
  let message: Message;
  let messageItemElement: HTMLElement;
  let userList: User[];

  function showMessageOfAuthor(authorId: number): void {
    fixture.componentRef.setInput('message', { ...message, authorId });
    fixture.detectChanges();
  }

  beforeEach(() => {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    message = { authorId: userList[0].id, body: 'Hello', conversationId: 1, id: 1, timestamp: 1625659200 };
    TestBed.configureTestingModule({
      providers: [{ provide: UserSession, useValue: { activeUser: signal(userList[0]), userList: signal(userList) } }]
    });
    fixture = TestBed.createComponent(MessageItem);
    messageItemElement = fixture.nativeElement as HTMLElement;
  });

  it('should show the message with its sending time', () => {
    showMessageOfAuthor(message.authorId);
    expect(messageItemElement.textContent).toContain(message.body);
    expect(messageItemElement.textContent).toContain(formatDate(timestampToDate(message.timestamp), 'HH:mm', 'en-US'));
  });

  describe('Message author setting', () => {
    describe('When the active user is the author of the message', () => {
      it('should show the message on the right side as sent by you', () => {
        showMessageOfAuthor(userList[0].id);
        expect(messageItemElement.classList).toContain('items-end');
        expect(messageItemElement.textContent).toContain('You');
      });
    });

    describe('When another user is the author of the message', () => {
      it('should show the message on the left side with the nickname of its author', () => {
        showMessageOfAuthor(userList[1].id);
        expect(messageItemElement.classList).toContain('items-start');
        expect(messageItemElement.textContent).toContain(userList[1].nickname);
      });
    });

    describe('When the author of the message is not among user list', () => {
      it('should show the message on the left side as sent by an unknown user', () => {
        const unknownUserId = 99;
        showMessageOfAuthor(unknownUserId);
        expect(messageItemElement.classList).toContain('items-start');
        expect(messageItemElement.textContent).toContain('Unknown user');
      });
    });
  });
});
