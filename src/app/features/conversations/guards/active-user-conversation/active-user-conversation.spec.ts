import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { Component, signal, WritableSignal } from '@angular/core';
import { Conversation } from '../../models/conversation/conversation.interface';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { activeUserConversationGuard } from './active-user-conversation';

@Component({ selector: 'app-page-stub', template: '' })
class PageStub {}

const CONVERSATIONS_URL = '/conversations';

describe('activeUserConversationGuard', () => {
  let activeUserConversation: Conversation;
  let activeUserConversations: {
    isActiveUserParticipantOfConversation: (conversationId: number) => boolean;
    isLoadingConversationList: WritableSignal<boolean>;
  };
  let otherUserConversation: Conversation;
  let router: Router;
  let routerHarness: RouterTestingHarness;
  let userSession: { isLoadingUserList: WritableSignal<boolean> };

  function getConversationUrl(conversation: Conversation): string {
    return `${CONVERSATIONS_URL}/${conversation.id}`;
  }

  function initMocks(): void {
    activeUserConversation = {
      id: 1,
      lastMessageTimestamp: 1625637849,
      recipientId: 2,
      recipientNickname: 'Bob',
      senderId: 1,
      senderNickname: 'Alice'
    };
    otherUserConversation = {
      id: 2,
      lastMessageTimestamp: 1620284667,
      recipientId: 4,
      recipientNickname: 'Dave',
      senderId: 3,
      senderNickname: 'Carol'
    };
    activeUserConversations = {
      isActiveUserParticipantOfConversation: (conversationId: number) => conversationId === activeUserConversation.id,
      isLoadingConversationList: signal(false)
    };
    userSession = { isLoadingUserList: signal(false) };
  }

  beforeEach(async () => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: ActiveUserConversations, useValue: activeUserConversations },
        { provide: UserSession, useValue: userSession },
        provideRouter([
          { path: 'conversations', pathMatch: 'full', component: PageStub },
          { path: 'conversations/:id', component: PageStub, canActivate: [activeUserConversationGuard] }
        ])
      ]
    });
    router = TestBed.inject(Router);
    routerHarness = await RouterTestingHarness.create();
  });

  describe('When user list is still loading', () => {
    it('should wait for it to load before deciding', async () => {
      const activeUserConversationUrl = getConversationUrl(activeUserConversation);
      userSession.isLoadingUserList.set(true);
      const navigation = routerHarness.navigateByUrl(activeUserConversationUrl);
      TestBed.tick();
      expect(router.url).not.toBe(activeUserConversationUrl);
      userSession.isLoadingUserList.set(false);
      await navigation;
      expect(router.url).toBe(activeUserConversationUrl);
    });
  });

  describe('When conversation list is still loading', () => {
    it('should wait for it to load before deciding', async () => {
      const activeUserConversationUrl = getConversationUrl(activeUserConversation);
      activeUserConversations.isLoadingConversationList.set(true);
      const navigation = routerHarness.navigateByUrl(activeUserConversationUrl);
      TestBed.tick();
      expect(router.url).not.toBe(activeUserConversationUrl);
      activeUserConversations.isLoadingConversationList.set(false);
      await navigation;
      expect(router.url).toBe(activeUserConversationUrl);
    });
  });

  describe('When user list and conversation list are loaded', () => {
    it('should let the conversation open when the active user is a participant of the conversation', async () => {
      await routerHarness.navigateByUrl(getConversationUrl(activeUserConversation));
      expect(router.url).toBe(getConversationUrl(activeUserConversation));
    });

    it('should redirect to the conversations when the active user is not a participant of the conversation', async () => {
      await routerHarness.navigateByUrl(getConversationUrl(otherUserConversation));
      expect(router.url).toBe(CONVERSATIONS_URL);
    });
  });
});
