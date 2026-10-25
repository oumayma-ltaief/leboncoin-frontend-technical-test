'use client';

import type { ChangeEvent } from 'react';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { InfoMessage } from '../../shared/components/info-message/info-message';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { useUserSession } from '../../core/users/hooks/use-user-session/use-user-session';

function UserSelectorContent() {
  const { activeUser, isLoadingUserList, reloadUserList, setActiveUser, userList, userListLoadingError } = useUserSession();

  function selectUser(userSelectionEvent: ChangeEvent<HTMLSelectElement>): void {
    setActiveUser(Number(userSelectionEvent.target.value));
  }

  if (isLoadingUserList) {
    return <Skeleton shape="field" tone="brand" />;
  }
  if (userListLoadingError) {
    return <ErrorMessage isCompact title="Couldn't load users" error={userListLoadingError} onRetry={reloadUserList} />;
  }
  if (!userList.length) {
    return <InfoMessage isCompact title="No users available" />;
  }
  return (
    <>
      <label htmlFor="user-selector" className="sr-only">
        Active user
      </label>
      <div className="relative w-28 max-w-full">
        <select
          id="user-selector"
          className="peer w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface px-3 py-2 pr-8 text-sm font-medium text-content-secondary shadow-sm transition duration-200 hover:border-brand hover:bg-brand-soft hover:text-brand-strong hover:shadow-md focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          value={activeUser?.id}
          onChange={selectUser}
        >
          {userList.map((user) => (
            <option key={user.id} value={user.id}>
              {user.nickname}
            </option>
          ))}
        </select>
        {/* Custom chevron icon for a more polished look */}
        <svg
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted peer-hover:scale-125 peer-hover:text-brand motion-safe:transition motion-safe:duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </>
  );
}

export function UserSelector() {
  return (
    <div className="flex min-w-0 justify-end">
      <UserSelectorContent />
    </div>
  );
}
