import { Component, signal, WritableSignal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

import { activeUserGuard } from './active-user';

@Component({ selector: 'app-page-stub', template: '' })
class PageStub {}

describe('activeUserGuard', () => {
  let activeUser: User;
  let router: Router;
  let routerHarness: RouterTestingHarness;
  let userSession: {
    activeUser: WritableSignal<User | undefined>;
    isLoadingUserList: WritableSignal<boolean>;
  };

  function initMocks(): void {
    activeUser = { id: 1, nickname: 'Alice', token: 'token-1' };
    userSession = {
      activeUser: signal<User | undefined>(undefined),
      isLoadingUserList: signal(false)
    };
  }

  beforeEach(async () => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: UserSession, useValue: userSession },
        provideRouter([
          { path: 'conversations', pathMatch: 'full', component: PageStub },
          { path: 'conversations/:id', component: PageStub, canActivate: [activeUserGuard] }
        ])
      ]
    });
    router = TestBed.inject(Router);
    routerHarness = await RouterTestingHarness.create();
  });

  it('should let the conversation open when a user is active', async () => {
    userSession.activeUser.set(activeUser);
    await routerHarness.navigateByUrl('/conversations/1');
    expect(router.url).toBe('/conversations/1');
  });

  it('should redirect to the conversations when no user is active', async () => {
    await routerHarness.navigateByUrl('/conversations/1');
    expect(router.url).toBe('/conversations');
  });

  it('should wait for the user list to load before deciding', async () => {
    userSession.isLoadingUserList.set(true);
    const navigation = routerHarness.navigateByUrl('/conversations/1');
    userSession.activeUser.set(activeUser);
    userSession.isLoadingUserList.set(false);
    await navigation;
    expect(router.url).toBe('/conversations/1');
  });
});
