'use client';

import { getInitial } from '../../shared/utils/initial/initial';
import { useConnectivity } from '../../core/connectivity/hooks/use-connectivity/use-connectivity';
import { useUserSession } from '../../core/users/hooks/use-user-session/use-user-session';

const OFFLINE_STATUS_CLASS = 'bg-offline';
const OFFLINE_STATUS_LABEL = 'offline';
const ONLINE_STATUS_CLASS = 'bg-online';
const ONLINE_STATUS_LABEL = 'online';

export function ActiveUser() {
  const { isOnline } = useConnectivity();
  const { activeUser } = useUserSession();

  if (!activeUser) {
    return null;
  }

  const activeUserInitial = getInitial(activeUser.nickname);
  const connectivityStatusClass = isOnline ? ONLINE_STATUS_CLASS : OFFLINE_STATUS_CLASS;
  const connectivityStatusLabel = isOnline ? ONLINE_STATUS_LABEL : OFFLINE_STATUS_LABEL;

  return (
    <div className="relative">
      <div className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong" aria-hidden="true">
        {activeUserInitial}
        <span className={`absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-surface ${connectivityStatusClass}`} />
      </div>
      <span className="sr-only">
        {activeUser.nickname}, {connectivityStatusLabel}
      </span>
    </div>
  );
}
