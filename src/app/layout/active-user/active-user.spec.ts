import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Connectivity } from '../../core/connectivity/services/connectivity/connectivity';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../core/users/models/user/user.interface';
import { UserSession } from '../../core/users/services/user-session/user-session';

import { ActiveUser } from './active-user';

describe('ActiveUser', () => {
  let activeUserComponent: ActiveUser;
  let connectivity: { isOnline: () => boolean };
  let fixture: ComponentFixture<ActiveUser>;
  let isConnectionAvailable: WritableSignal<boolean>;
  let userList: User[];
  let userSession: { activeUser: WritableSignal<User | undefined> };

  function getConnectivityStatus(): { indicatorClass: string; label: string } {
    fixture.detectChanges();
    const activeUserElement = fixture.nativeElement as HTMLElement;
    return {
      indicatorClass: activeUserElement.querySelector('span')!.className,
      label: activeUserElement.querySelector('.sr-only')!.textContent.trim()
    };
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    userSession = { activeUser: signal<User | undefined>(userList[0]) };
    isConnectionAvailable = signal(true);
    connectivity = { isOnline: () => isConnectionAvailable() };
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: Connectivity, useValue: connectivity },
        { provide: UserSession, useValue: userSession }
      ]
    });
    fixture = TestBed.createComponent(ActiveUser);
    activeUserComponent = fixture.componentInstance;
  });

  describe('Active user setting', () => {
    it('should set the active user of the session', () => {
      expect(activeUserComponent['activeUser']()).toEqual(userList[0]);
    });
  });

  describe('Online status setting', () => {
    it('should become offline when connectivity is lost', () => {
      expect(getConnectivityStatus().label).toBe('Alice, online');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-green-500');
      isConnectionAvailable.set(false);
      expect(getConnectivityStatus().label).toBe('Alice, offline');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-red-400');
    });

    it('should become online when connectivity is back', () => {
      isConnectionAvailable.set(false);
      expect(getConnectivityStatus().label).toBe('Alice, offline');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-red-400');
      isConnectionAvailable.set(true);
      expect(getConnectivityStatus().label).toBe('Alice, online');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-green-500');
    });
  });
});
