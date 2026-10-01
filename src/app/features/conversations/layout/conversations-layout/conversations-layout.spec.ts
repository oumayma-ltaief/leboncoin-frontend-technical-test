import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';

import { ConversationsLayout } from './conversations-layout';

@Component({ selector: 'app-conversation-empty-stub', template: '' })
class ConversationEmptyStub {}

@Component({ selector: 'app-conversation-detail-stub', template: '' })
class ConversationDetailStub {}

const CONVERSATION_LIST = 'aside';
const CONVERSATION_PANEL = 'section[aria-label="Conversation"]';

describe('ConversationsLayout', () => {
  let routerHarness: RouterTestingHarness;

  const isElementVisible = (elementSelector: string): boolean => {
    const element = routerHarness.routeNativeElement!.querySelector(elementSelector) as HTMLElement;
    return element.classList.contains('flex') && !element.classList.contains('hidden');
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'conversations',
            component: ConversationsLayout,
            children: [
              { path: '', pathMatch: 'full', component: ConversationEmptyStub },
              { path: ':id', component: ConversationDetailStub }
            ]
          }
        ])
      ]
    });
    routerHarness = await RouterTestingHarness.create();
  });

  describe('When no conversation is open', () => {
    beforeEach(async () => {
      await routerHarness.navigateByUrl('/conversations', ConversationsLayout);
    });

    it('should hide the conversation list when a conversation is opened', async () => {
      expect(isElementVisible(CONVERSATION_LIST)).toBe(true);
      await routerHarness.navigateByUrl('/conversations/1');
      expect(isElementVisible(CONVERSATION_LIST)).toBe(false);
    });

    it('should show the conversation panel when a conversation is opened', async () => {
      expect(isElementVisible(CONVERSATION_PANEL)).toBe(false);
      await routerHarness.navigateByUrl('/conversations/1');
      expect(isElementVisible(CONVERSATION_PANEL)).toBe(true);
    });
  });

  describe('When a conversation is open', () => {
    beforeEach(async () => {
      await routerHarness.navigateByUrl('/conversations/1', ConversationsLayout);
    });

    it('should show the conversation list when the conversation is closed', async () => {
      expect(isElementVisible(CONVERSATION_LIST)).toBe(false);
      await routerHarness.navigateByUrl('/conversations');
      expect(isElementVisible(CONVERSATION_LIST)).toBe(true);
    });

    it('should hide the conversation panel when the conversation is closed', async () => {
      expect(isElementVisible(CONVERSATION_PANEL)).toBe(true);
      await routerHarness.navigateByUrl('/conversations');
      expect(isElementVisible(CONVERSATION_PANEL)).toBe(false);
    });
  });
});
