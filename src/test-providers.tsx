import { act, render } from '@testing-library/react';
import { ActiveUserIdProvider } from './app/core/users/components/active-user-id-provider/active-user-id-provider';
import { QUERY_CLIENT_CONFIG } from './app/core/config/query.config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement, type ReactNode, useSyncExternalStore } from 'react';
import { ThemeProvider } from './app/core/theme/components/theme-provider/theme-provider';
import type { UserSession } from './app/core/users/hooks/use-user-session/use-user-session';

interface MockedHookState<State> {
  current: () => State;
  set: (stateChange: Partial<State>) => void;
  use: () => State;
}

interface SavedPreferences {
  savedActiveUserId?: string;
  savedTheme?: string;
}

const EXPIRED_COOKIE_ATTRIBUTES = 'path=/; max-age=0';

export function buildUserSession(userSession: Partial<UserSession>): UserSession {
  return {
    activeUser: undefined,
    isLoadingUserList: false,
    reloadUserList: vi.fn(),
    setActiveUser: vi.fn(),
    userList: [],
    userListLoadingError: undefined,
    ...userSession
  };
}

export function clearCookies(): void {
  document.cookie.split('; ').forEach((cookie) => {
    const [cookieName] = cookie.split('=');
    document.cookie = `${cookieName ?? ''}=; ${EXPIRED_COOKIE_ATTRIBUTES}`;
  });
}

export function createMockedHookState<State>(initialState: State): MockedHookState<State> {
  let state = initialState;
  const stateListeners = new Set<() => void>();

  function subscribe(stateListener: () => void): () => void {
    stateListeners.add(stateListener);
    return () => stateListeners.delete(stateListener);
  }

  return {
    current: () => state,
    set: (stateChange) => {
      state = { ...state, ...stateChange };
      act(() => {
        stateListeners.forEach((stateListener) => {
          stateListener();
        });
      });
    },
    use: () => useSyncExternalStore(subscribe, () => state)
  };
}

export function createTestProviders({ savedActiveUserId, savedTheme }: SavedPreferences = {}): ({ children }: { children: ReactNode }) => ReactNode {
  const queryClient = new QueryClient(QUERY_CLIENT_CONFIG);
  return function TestProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ActiveUserIdProvider savedActiveUserId={savedActiveUserId}>
          <ThemeProvider savedTheme={savedTheme}>{children}</ThemeProvider>
        </ActiveUserIdProvider>
      </QueryClientProvider>
    );
  };
}

export function readCookie(cookieName: string): string | undefined {
  const cookie = document.cookie.split('; ').find((cookieEntry) => cookieEntry.startsWith(`${cookieName}=`));
  return cookie ? decodeURIComponent(cookie.slice(cookieName.length + 1)) : undefined;
}

export function renderWithProviders(ui: ReactElement): ReturnType<typeof render> {
  return render(ui, { wrapper: createTestProviders() });
}

export async function waitForPendingWork(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
