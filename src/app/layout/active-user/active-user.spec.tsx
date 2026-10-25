import { buildUserSession, createMockedHookState } from '../../../test-providers';
import { render, screen } from '@testing-library/react';
import { useConnectivity } from '../../core/connectivity/hooks/use-connectivity/use-connectivity';
import type { User } from '../../core/users/models/user/user';
import { useUserSession } from '../../core/users/hooks/use-user-session/use-user-session';

import { ActiveUser } from './active-user';

vi.mock('../../core/connectivity/hooks/use-connectivity/use-connectivity');
vi.mock('../../core/users/hooks/use-user-session/use-user-session');

describe('ActiveUser', () => {
  let activeUserElement: HTMLElement;
  let connectivity: ReturnType<typeof createMockedHookState<{ isOnline: boolean }>>;
  let userList: [User, User];

  function getConnectivityStatus(): { indicatorClass: string; label: string } {
    return {
      indicatorClass: activeUserElement.querySelector('span')?.className ?? '',
      label: activeUserElement.querySelector('.sr-only')?.textContent.trim() ?? ''
    };
  }

  function initMocks(): void {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    connectivity = createMockedHookState<{ isOnline: boolean }>({ isOnline: true });
    vi.mocked(useConnectivity).mockImplementation(connectivity.use);
    vi.mocked(useUserSession).mockReturnValue(buildUserSession({ activeUser: userList[0], userList }));
  }

  beforeEach(() => {
    initMocks();
    activeUserElement = render(<ActiveUser />).container;
  });

  describe('Active user setting', () => {
    it('should show the initial of the active user of the session', () => {
      expect(screen.getByText('A')).not.toBeNull();
    });
  });

  describe('Online status setting', () => {
    it('should become offline when connectivity is lost', () => {
      expect(getConnectivityStatus().label).toBe('Alice, online');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-online');
      connectivity.set({ isOnline: false });
      expect(getConnectivityStatus().label).toBe('Alice, offline');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-offline');
    });

    it('should become online when connectivity is back', () => {
      connectivity.set({ isOnline: false });
      expect(getConnectivityStatus().label).toBe('Alice, offline');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-offline');
      connectivity.set({ isOnline: true });
      expect(getConnectivityStatus().label).toBe('Alice, online');
      expect(getConnectivityStatus().indicatorClass).toContain('bg-online');
    });
  });
});
