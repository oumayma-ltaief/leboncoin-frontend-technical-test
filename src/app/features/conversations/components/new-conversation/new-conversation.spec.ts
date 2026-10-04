import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from '../../models/conversation/conversation.interface';
import type { Mock } from 'vitest';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { NewConversation } from './new-conversation';

describe('NewConversation', () => {
  let activeUserConversations: { createConversation: Mock; findConversationWith: Mock };
  let conversationCreationResponse: Subject<Conversation>;
  let existingConversation: Conversation;
  let fixture: ComponentFixture<NewConversation>;
  let newConversationElement: HTMLElement;
  let router: Router;
  let userList: User[];

  function chooseRecipient(recipient: User): void {
    const recipientButtons = Array.from(newConversationElement.querySelectorAll<HTMLButtonElement>('dialog li button'));
    recipientButtons.find((recipientButton) => recipientButton.textContent.includes(recipient.nickname))!.click();
    fixture.detectChanges();
  }

  function getConversationRecipientDialog(): HTMLDialogElement {
    return newConversationElement.querySelector('dialog')!;
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' },
      { id: 3, nickname: 'Carol', token: 'token-3' }
    ];
    existingConversation = {
      id: 7,
      lastMessageTimestamp: 1625637849,
      recipientId: 2,
      recipientNickname: 'Bob',
      senderId: 1,
      senderNickname: 'Alice'
    };
    conversationCreationResponse = new Subject<Conversation>();
    activeUserConversations = {
      createConversation: vi.fn(() => conversationCreationResponse),
      findConversationWith: vi.fn((user: User) => (user.id === existingConversation.recipientId ? existingConversation : undefined))
    };
  }

  function openConversationRecipientDialog(): void {
    newConversationElement.querySelector<HTMLButtonElement>('button[aria-label="New conversation"]')!.click();
    fixture.detectChanges();
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActiveUserConversations, useValue: activeUserConversations },
        { provide: UserSession, useValue: { userList: signal(userList) } }
      ]
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(NewConversation);
    fixture.componentRef.setInput('activeUser', userList[0]);
    newConversationElement = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  describe('Open conversation recipient dialog', () => {
    it('should list every user except the active user', () => {
      expect(getConversationRecipientDialog().open).toBe(false);
      openConversationRecipientDialog();
      expect(getConversationRecipientDialog().open).toBe(true);
      const recipientNicknames = Array.from(getConversationRecipientDialog().querySelectorAll('li'), (recipient) =>
        recipient.textContent.replace(/\s+/g, ' ').trim()
      );
      expect(recipientNicknames).toEqual(['B Bob', 'C Carol']);
    });
  });

  describe('Start conversation with a recipient', () => {
    beforeEach(() => {
      openConversationRecipientDialog();
    });

    describe('When the active user already has a conversation with the recipient', () => {
      it('should open that conversation without creating any', () => {
        expect(router.navigate).not.toHaveBeenCalled();
        chooseRecipient(userList[1]);
        expect(activeUserConversations.createConversation).not.toHaveBeenCalled();
        expect(getConversationRecipientDialog().open).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/conversations', existingConversation.id]);
      });
    });

    describe('When the active user has no conversation with the recipient', () => {
      let createdConversation: Conversation;

      beforeEach(() => {
        createdConversation = {
          id: 8,
          lastMessageTimestamp: 1625659200,
          recipientId: 3,
          recipientNickname: 'Carol',
          senderId: 1,
          senderNickname: 'Alice'
        };
      });

      it('should create the conversation and open it', () => {
        expect(activeUserConversations.createConversation).not.toHaveBeenCalled();
        chooseRecipient(userList[2]);
        expect(activeUserConversations.createConversation).toHaveBeenCalledWith(userList[0], userList[2]);
        expect(router.navigate).not.toHaveBeenCalled();
        conversationCreationResponse.next(createdConversation);
        conversationCreationResponse.complete();
        expect(getConversationRecipientDialog().open).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/conversations', createdConversation.id]);
      });

      it('should show the error and create the conversation again when trying again', () => {
        chooseRecipient(userList[2]);
        conversationCreationResponse.error(new AppError('network'));
        conversationCreationResponse = new Subject<Conversation>();
        fixture.detectChanges();
        expect(getConversationRecipientDialog().textContent).toContain("Couldn't create conversation");
        expect(activeUserConversations.createConversation).toHaveBeenCalledTimes(1);
        getConversationRecipientDialog().querySelector<HTMLButtonElement>('app-error-message button')!.click();
        expect(activeUserConversations.createConversation).toHaveBeenCalledTimes(2);
        expect(activeUserConversations.createConversation).toHaveBeenLastCalledWith(userList[0], userList[2]);
      });
    });
  });
});
