import { AppError } from '../../../errors/models/app-error/app-error';
import { ApplicationRef } from '@angular/core';
import { Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { User } from '../../models/user/user.interface';
import { Users } from '../users/users';

import { UserSession } from './user-session';

describe('UserSession', () => {
  let userList: User[];
  let userSession: UserSession;
  let usersResponse: Subject<User[]>;

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    usersResponse = new Subject<User[]>();
  }

  async function serverFails(error: Error = new Error('Service unavailable')): Promise<void> {
    usersResponse.error(error);
    await waitForLoading();
  }

  async function serverRespondsWith(users: User[]): Promise<void> {
    usersResponse.next(users);
    await waitForLoading();
  }

  async function waitForLoading(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(() => {
    initMocks();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Users, useValue: { getUsers: () => usersResponse } }]
    });
    userSession = TestBed.inject(UserSession);
    TestBed.tick();
  });

  describe('Load user list and default active user settings', () => {
    describe('When loading user list fails', () => {
      it('should stop loading and keep an empty list without a default active user', async () => {
        expect(userSession.isLoadingUserList()).toBe(true);
        expect(userSession.userList()).toEqual([]);
        expect(userSession.activeUser()).toBeUndefined();
        await serverFails();
        expect(userSession.isLoadingUserList()).toBe(false);
        expect(userSession.userList()).toEqual([]);
        expect(userSession.activeUser()).toBeUndefined();
      });

      it('should expose the error of user list loading', async () => {
        expect(userSession.userListLoadingError()).toBeUndefined();
        await serverFails();
        expect(userSession.userListLoadingError()).toBeInstanceOf(AppError);
        expect(userSession.userListLoadingError()?.kind).toBe('unknown');
      });

      it('should expose the app error the loading failed with', async () => {
        const networkError = new AppError('network');
        await serverFails(networkError);
        expect(userSession.userListLoadingError()).toBe(networkError);
      });
    });

    describe('When loading user list succeeds', () => {
      describe('When the loaded user list is empty', () => {
        it('should stop loading with an empty list, no error and no active user', async () => {
          expect(userSession.isLoadingUserList()).toBe(true);
          expect(userSession.userListLoadingError()).toBeUndefined();
          expect(userSession.userList()).toEqual([]);
          expect(userSession.activeUser()).toBeUndefined();
          await serverRespondsWith([]);
          expect(userSession.isLoadingUserList()).toBe(false);
          expect(userSession.userListLoadingError()).toBeUndefined();
          expect(userSession.userList()).toEqual([]);
          expect(userSession.activeUser()).toBeUndefined();
        });
      });

      describe('When loaded user list is filled', () => {
        it('should stop loading, expose user list and make the first user the active user', async () => {
          expect(userSession.isLoadingUserList()).toBe(true);
          expect(userSession.userListLoadingError()).toBeUndefined();
          expect(userSession.userList()).toEqual([]);
          expect(userSession.activeUser()).toBeUndefined();
          await serverRespondsWith(userList);
          expect(userSession.isLoadingUserList()).toBe(false);
          expect(userSession.userListLoadingError()).toBeUndefined();
          expect(userSession.userList()).toEqual(userList);
          expect(userSession.activeUser()).toEqual(userList[0]);
        });
      });
    });
  });

  describe('Reload user list', () => {
    describe('When user list failed to load', () => {
      beforeEach(async () => {
        await serverFails();
        usersResponse = new Subject<User[]>();
      });

      it('should clear the error and load the users when user list is reloaded', async () => {
        expect(userSession.isLoadingUserList()).toBe(false);
        expect(userSession.userListLoadingError()).toBeTruthy();
        expect(userSession.userList()).toEqual([]);
        expect(userSession.activeUser()).toBeUndefined();
        userSession.reloadUserList();
        TestBed.tick();
        await serverRespondsWith(userList);
        expect(userSession.isLoadingUserList()).toBe(false);
        expect(userSession.userListLoadingError()).toBeUndefined();
        expect(userSession.userList()).toEqual(userList);
        expect(userSession.activeUser()).toEqual(userList[0]);
      });
    });
  });

  describe('Set active user', () => {
    beforeEach(async () => {
      await serverRespondsWith(userList);
    });

    it('should switch the active user when another user is selected', () => {
      const [firstUser, secondUser] = userList;
      expect(userSession.activeUser()).toEqual(firstUser);
      userSession.setActiveUser(secondUser.id);
      expect(userSession.activeUser()).toEqual(secondUser);
    });

    it('should keep the selected user active after the app is reloaded', async () => {
      userSession.setActiveUser(userList[1].id);
      const reloadedUserSession = TestBed.runInInjectionContext(() => new UserSession());
      TestBed.tick();
      expect(reloadedUserSession.activeUser()).toBeUndefined();
      await serverRespondsWith(userList);
      expect(reloadedUserSession.activeUser()).toEqual(userList[1]);
    });
  });
});
