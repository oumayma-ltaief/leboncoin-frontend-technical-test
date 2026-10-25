import { act } from '@testing-library/react';
import { useSyncExternalStore } from 'react';

interface NavigationState {
  params: Record<string, string>;
  pathname: string;
}

const INITIAL_NAVIGATION_STATE: NavigationState = { params: {}, pathname: '/' };

let navigationState = INITIAL_NAVIGATION_STATE;
const navigationListeners = new Set<() => void>();

function getNavigationState(): NavigationState {
  return navigationState;
}

function notifyNavigationListeners(): void {
  navigationListeners.forEach((navigationListener) => {
    navigationListener();
  });
}

function setNavigationState(nextNavigationState: NavigationState): void {
  navigationState = nextNavigationState;
  notifyNavigationListeners();
}

function subscribeToNavigation(navigationListener: () => void): () => void {
  navigationListeners.add(navigationListener);
  return () => navigationListeners.delete(navigationListener);
}

export const RedirectType = { push: 'push', replace: 'replace' } as const;

export const redirect = vi.fn();

export const router = {
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  push: vi.fn((pathname: string) => {
    setNavigationState({ params: {}, pathname });
  }),
  refresh: vi.fn(),
  replace: vi.fn((pathname: string) => {
    setNavigationState({ params: {}, pathname });
  })
};

export function getCurrentPathname(): string {
  return navigationState.pathname;
}

export function openUrl(pathname: string, params: Record<string, string> = {}): void {
  act(() => {
    setNavigationState({ params, pathname });
  });
}

export function resetNavigation(): void {
  navigationState = INITIAL_NAVIGATION_STATE;
  redirect.mockClear();
  Object.values(router).forEach((routerMethod) => {
    routerMethod.mockClear();
  });
}

export function useParams(): Record<string, string> {
  return useSyncExternalStore(subscribeToNavigation, getNavigationState).params;
}

export function usePathname(): string {
  return useSyncExternalStore(subscribeToNavigation, getNavigationState).pathname;
}

export function useRouter(): typeof router {
  return router;
}
