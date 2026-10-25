'use client';

import { ACTIVE_USER_ID_COOKIE_NAME } from '../../../config/cookies.config';
import { ActiveUserIdContext } from '../../contexts/active-user-id/active-user-id';
import { type ReactNode, useState } from 'react';
import { storeCookie } from '../../../storage/utils/browser-cookie/browser-cookie';

interface ActiveUserIdProviderProps {
  children: ReactNode;
  savedActiveUserId: string | undefined;
}

function toActiveUserId(savedActiveUserId: string | undefined): number | undefined {
  return savedActiveUserId ? Number(savedActiveUserId) : undefined;
}

export function ActiveUserIdProvider({ children, savedActiveUserId }: ActiveUserIdProviderProps) {
  const [activeUserId, setActiveUserIdState] = useState(() => toActiveUserId(savedActiveUserId));

  function setActiveUserId(userId: number): void {
    setActiveUserIdState(userId);
    storeCookie(ACTIVE_USER_ID_COOKIE_NAME, String(userId));
  }

  return <ActiveUserIdContext value={{ activeUserId, setActiveUserId }}>{children}</ActiveUserIdContext>;
}
