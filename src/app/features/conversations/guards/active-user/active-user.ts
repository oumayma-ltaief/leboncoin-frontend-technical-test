import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

export const activeUserGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userSession = inject(UserSession);

  return toObservable(userSession.isLoadingUserList).pipe(
    filter((isLoadingUserList) => !isLoadingUserList),
    take(1),
    map(() => (userSession.activeUser() ? true : router.parseUrl('/conversations')))
  );
};
