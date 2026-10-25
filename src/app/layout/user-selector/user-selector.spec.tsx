import { AppError } from '../../core/errors/models/app-error/app-error';
import { buildUserSession, createMockedHookState } from '../../../test-providers';
import { fireEvent, render, screen } from '@testing-library/react';
import type { User } from '../../core/users/models/user/user';
import { type UserSession, useUserSession } from '../../core/users/hooks/use-user-session/use-user-session';

import { UserSelector } from './user-selector';

vi.mock('../../core/users/hooks/use-user-session/use-user-session');

describe('UserSelector', () => {
  let userList: [User, User];
  let userSelectorElement: HTMLElement;
  let userSession: ReturnType<typeof createMockedHookState<UserSession>>;

  function getDropdown(): HTMLSelectElement | null {
    return screen.queryByRole('combobox');
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    userSession = createMockedHookState(buildUserSession({ activeUser: userList[0], userList }));
    vi.mocked(useUserSession).mockImplementation(userSession.use);
  }

  beforeEach(() => {
    initMocks();
    userSelectorElement = render(<UserSelector />).container;
  });

  describe('Show user list', () => {
    describe('When user list is loading', () => {
      it('should show a skeleton instead of the dropdown', () => {
        userSession.set({ isLoadingUserList: true });
        expect(getDropdown()).toBeNull();
        expect(screen.getByRole('status', { name: 'Loading' })).not.toBeNull();
      });
    });

    describe('When user list failed to load', () => {
      it('should show the error instead of the dropdown', () => {
        userSession.set({ userListLoadingError: new AppError('network') });
        expect(getDropdown()).toBeNull();
        expect(userSelectorElement.textContent).toContain("Couldn't load users");
      });
    });

    describe('When user list is empty', () => {
      it('should show that no users are available instead of the dropdown', () => {
        userSession.set({ activeUser: undefined, userList: [] });
        expect(getDropdown()).toBeNull();
        expect(userSelectorElement.textContent).toContain('No users available');
      });
    });

    describe('When user list is loaded', () => {
      it('should list the users in the dropdown with the active user selected', () => {
        const dropdown = getDropdown();
        expect(Array.from(dropdown?.options ?? [], (option) => option.text)).toEqual(['Alice', 'Bob']);
        expect(dropdown?.value).toBe('1');
      });
    });
  });

  describe('Reload user list', () => {
    describe('When user list failed to load', () => {
      it('should reload user list when trying again', () => {
        userSession.set({ userListLoadingError: new AppError('network') });
        expect(userSession.current().reloadUserList).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(userSession.current().reloadUserList).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Select user', () => {
    describe('When user list is loaded', () => {
      it('should activate the user chosen in the dropdown', () => {
        expect(userSession.current().setActiveUser).not.toHaveBeenCalled();
        fireEvent.change(getDropdown()!, { target: { value: '2' } });
        expect(userSession.current().setActiveUser).toHaveBeenCalledWith(2);
      });
    });
  });
});
