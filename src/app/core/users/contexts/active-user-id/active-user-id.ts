import { createContext, use } from 'react';

const MISSING_PROVIDER_MESSAGE = 'The active user id is only available inside ActiveUserIdProvider';

export interface ActiveUserIdState {
  activeUserId: number | undefined;
  setActiveUserId: (userId: number) => void;
}

export const ActiveUserIdContext = createContext<ActiveUserIdState | undefined>(undefined);

export function useActiveUserId(): ActiveUserIdState {
  const activeUserIdState = use(ActiveUserIdContext);
  if (!activeUserIdState) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return activeUserIdState;
}
