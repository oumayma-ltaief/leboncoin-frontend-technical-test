import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { ConversationList } from './conversation-list';

describe('ConversationList', () => {
  let activeUser: User;
  let fixture: ComponentFixture<ConversationList>;
  let userSession: {
    activeUser: WritableSignal<User | undefined>;
    isLoadingUserList: WritableSignal<boolean>;
  };

  function getContent(): string {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('nav')!.textContent.trim();
  }

  function initMocks(): void {
    activeUser = { id: 1, nickname: 'Alice', token: 'token-1' };
    userSession = {
      activeUser: signal<User | undefined>(undefined),
      isLoadingUserList: signal(false)
    };
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: UserSession, useValue: userSession }]
    });
    fixture = TestBed.createComponent(ConversationList);
  });

  describe('When no user is active', () => {
    it('should show a loading state instead of the conversations while the user list is loading', () => {
      userSession.isLoadingUserList.set(true);
      expect(getContent()).toBe('');
      expect((fixture.nativeElement as HTMLElement).querySelector('nav app-skeleton')).not.toBeNull();
    });

    it('should show that there is no active user instead of the conversations when the user list is not loading', () => {
      expect(getContent()).toContain('No active user');
    });
  });

  describe('When a user is active', () => {
    it('should show the conversations content', () => {
      userSession.activeUser.set(activeUser);
      expect(getContent()).toContain('No conversations yet');
    });
  });
});
