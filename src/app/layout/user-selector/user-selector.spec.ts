import { AppError } from '../../core/errors/models/app-error/app-error';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../core/users/models/user/user.interface';
import { UserSession } from '../../core/users/services/user-session/user-session';

import { UserSelector } from './user-selector';

describe('UserSelector', () => {
  let fixture: ComponentFixture<UserSelector>;
  let userList: User[];
  let userSelectorElement: HTMLElement;
  let userSession: {
    activeUser: WritableSignal<User | undefined>;
    isLoadingUserList: WritableSignal<boolean>;
    reloadUserList: Mock;
    setActiveUser: Mock;
    userList: WritableSignal<User[]>;
    userListLoadingError: WritableSignal<AppError | undefined>;
  };

  function getDropdown(): HTMLSelectElement | null {
    fixture.detectChanges();
    return userSelectorElement.querySelector('select');
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    userSession = {
      activeUser: signal<User | undefined>(userList[0]),
      isLoadingUserList: signal(false),
      reloadUserList: vi.fn(),
      setActiveUser: vi.fn(),
      userList: signal<User[]>(userList),
      userListLoadingError: signal<AppError | undefined>(undefined)
    };
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: UserSession, useValue: userSession }]
    });
    fixture = TestBed.createComponent(UserSelector);
    userSelectorElement = fixture.nativeElement as HTMLElement;
  });

  describe('Show user list', () => {
    describe('When user list is loading', () => {
      it('should show a skeleton instead of the dropdown', () => {
        userSession.isLoadingUserList.set(true);
        expect(getDropdown()).toBeNull();
        expect(userSelectorElement.querySelector('app-skeleton')).not.toBeNull();
      });
    });

    describe('When user list failed to load', () => {
      it('should show the error instead of the dropdown', () => {
        userSession.userListLoadingError.set(new AppError('network'));
        expect(getDropdown()).toBeNull();
        expect(userSelectorElement.textContent).toContain("Couldn't load users");
      });
    });

    describe('When user list is empty', () => {
      it('should show that no users are available instead of the dropdown', () => {
        userSession.userList.set([]);
        expect(getDropdown()).toBeNull();
        expect(userSelectorElement.textContent).toContain('No users available');
      });
    });

    describe('When user list is loaded', () => {
      it('should list the users in the dropdown with the active user selected', () => {
        const dropdown = getDropdown()!;
        expect(Array.from(dropdown.options, (option) => option.text)).toEqual(['Alice', 'Bob']);
        expect(dropdown.value).toBe('1');
      });
    });
  });

  describe('Reload user list', () => {
    describe('When user list failed to load', () => {
      it('should reload user list when trying again', () => {
        userSession.userListLoadingError.set(new AppError('network'));
        fixture.detectChanges();
        expect(userSession.reloadUserList).not.toHaveBeenCalled();
        userSelectorElement.querySelector('button')!.click();
        expect(userSession.reloadUserList).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Select user', () => {
    describe('When user list is loaded', () => {
      it('should activate the user chosen in the dropdown and check the access to the current page again', () => {
        const router = TestBed.inject(Router);
        vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
        const dropdown = getDropdown()!;
        expect(userSession.setActiveUser).not.toHaveBeenCalled();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        dropdown.value = '2';
        dropdown.dispatchEvent(new Event('change'));
        expect(userSession.setActiveUser).toHaveBeenCalledWith(2);
        expect(router.navigateByUrl).toHaveBeenCalledWith(router.url, { onSameUrlNavigation: 'reload' });
      });
    });
  });
});
