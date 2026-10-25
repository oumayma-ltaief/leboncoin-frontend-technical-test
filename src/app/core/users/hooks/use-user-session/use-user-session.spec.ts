import { act, renderHook } from '@testing-library/react';
import { ACTIVE_USER_ID_COOKIE_NAME } from '../../../config/cookies.config';
import { AppError } from '../../../errors/models/app-error/app-error';
import { clearCookies, createTestProviders, readCookie, waitForPendingWork } from '../../../../../test-providers';
import type { User } from '../../models/user/user';
import { Users } from '../../services/users/users';

import { type UserSession, useUserSession } from './use-user-session';

describe('useUserSession', () => {
  let userSession: { current: UserSession };
  let userList: User[];
  let usersResponse: PromiseWithResolvers<User[]>;
  let userSessionProviders: ReturnType<typeof createTestProviders>;

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    usersResponse = Promise.withResolvers<User[]>();
    vi.spyOn(Users, 'getUsers').mockImplementation(() => usersResponse.promise);
  }

  async function serverFails(error: AppError = new AppError('unavailable')): Promise<void> {
    usersResponse.reject(error);
    await waitForLoading();
  }

  async function serverRespondsWith(users: User[]): Promise<void> {
    usersResponse.resolve(users);
    await waitForLoading();
  }

  function startApp(): { current: UserSession } {
    userSessionProviders = createTestProviders({ savedActiveUserId: readCookie(ACTIVE_USER_ID_COOKIE_NAME) });
    return renderHook(() => useUserSession(), { wrapper: userSessionProviders }).result;
  }

  async function waitForLoading(): Promise<void> {
    await waitForPendingWork();
  }

  beforeEach(() => {
    initMocks();
    clearCookies();
    userSession = startApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Load user list and default active user settings', () => {
    describe('When loading user list fails', () => {
      it('should stop loading and keep an empty list without a default active user', async () => {
        expect(userSession.current.isLoadingUserList).toBe(true);
        expect(userSession.current.userList).toEqual([]);
        expect(userSession.current.activeUser).toBeUndefined();
        await serverFails();
        expect(userSession.current.isLoadingUserList).toBe(false);
        expect(userSession.current.userList).toEqual([]);
        expect(userSession.current.activeUser).toBeUndefined();
      });

      it('should expose the app error the loading failed with', async () => {
        const networkError = new AppError('network');
        expect(userSession.current.userListLoadingError).toBeUndefined();
        await serverFails(networkError);
        expect(userSession.current.userListLoadingError).toBe(networkError);
      });
    });

    describe('When loading user list succeeds', () => {
      it('should load user list once for every part of the app that reads it, even one shown later', async () => {
        await serverRespondsWith(userList);
        expect(Users.getUsers).toHaveBeenCalledTimes(1);
        const laterUserSession = renderHook(() => useUserSession(), { wrapper: userSessionProviders }).result;
        await waitForLoading();
        expect(laterUserSession.current.userList).toEqual(userList);
        expect(Users.getUsers).toHaveBeenCalledTimes(1);
      });

      describe('When the loaded user list is empty', () => {
        it('should stop loading with an empty list, no error and no active user', async () => {
          expect(userSession.current.isLoadingUserList).toBe(true);
          expect(userSession.current.userListLoadingError).toBeUndefined();
          expect(userSession.current.userList).toEqual([]);
          expect(userSession.current.activeUser).toBeUndefined();
          await serverRespondsWith([]);
          expect(userSession.current.isLoadingUserList).toBe(false);
          expect(userSession.current.userListLoadingError).toBeUndefined();
          expect(userSession.current.userList).toEqual([]);
          expect(userSession.current.activeUser).toBeUndefined();
        });
      });

      describe('When loaded user list is filled', () => {
        it('should stop loading, expose user list and make the first user the active user', async () => {
          expect(userSession.current.isLoadingUserList).toBe(true);
          expect(userSession.current.userListLoadingError).toBeUndefined();
          expect(userSession.current.userList).toEqual([]);
          expect(userSession.current.activeUser).toBeUndefined();
          await serverRespondsWith(userList);
          expect(userSession.current.isLoadingUserList).toBe(false);
          expect(userSession.current.userListLoadingError).toBeUndefined();
          expect(userSession.current.userList).toEqual(userList);
          expect(userSession.current.activeUser).toEqual(userList[0]);
        });
      });
    });
  });

  describe('Reload user list', () => {
    describe('When user list failed to load', () => {
      beforeEach(async () => {
        await serverFails();
        usersResponse = Promise.withResolvers<User[]>();
      });

      it('should clear the error and load the users when user list is reloaded', async () => {
        expect(userSession.current.isLoadingUserList).toBe(false);
        expect(userSession.current.userListLoadingError).toBeTruthy();
        expect(userSession.current.userList).toEqual([]);
        expect(userSession.current.activeUser).toBeUndefined();
        await act(async () => {
          userSession.current.reloadUserList();
          await Promise.resolve();
        });
        expect(userSession.current.isLoadingUserList).toBe(true);
        await serverRespondsWith(userList);
        expect(userSession.current.isLoadingUserList).toBe(false);
        expect(userSession.current.userListLoadingError).toBeUndefined();
        expect(userSession.current.userList).toEqual(userList);
        expect(userSession.current.activeUser).toEqual(userList[0]);
      });
    });
  });

  describe('Set active user', () => {
    beforeEach(async () => {
      await serverRespondsWith(userList);
    });

    it('should switch the active user when another user is selected', () => {
      const [firstUser, secondUser] = userList as [User, User];
      expect(userSession.current.activeUser).toEqual(firstUser);
      act(() => {
        userSession.current.setActiveUser(secondUser.id);
      });
      expect(userSession.current.activeUser).toEqual(secondUser);
    });

    it('should keep the selected user active after the app is reloaded', async () => {
      const [, secondUser] = userList as [User, User];
      act(() => {
        userSession.current.setActiveUser(secondUser.id);
      });
      usersResponse = Promise.withResolvers<User[]>();
      const reloadedUserSession = startApp();
      expect(reloadedUserSession.current.activeUser).toBeUndefined();
      await serverRespondsWith(userList);
      expect(reloadedUserSession.current.activeUser).toEqual(secondUser);
    });
  });
});
