import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { CanActivateFn, Router } from '@angular/router';
import { computed, inject } from '@angular/core';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import { filter, map, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

export const activeUserConversationGuard: CanActivateFn = (route) => {
  const activeUserConversations = inject(ActiveUserConversations);
  const router = inject(Router);
  const userSession = inject(UserSession);

  const conversationId = Number(route.paramMap.get('id'));
  const isLoading = computed(() => userSession.isLoadingUserList() || activeUserConversations.isLoadingConversationList());

  return toObservable(isLoading).pipe(
    filter((isStillLoading) => !isStillLoading),
    take(1),
    map(() => (activeUserConversations.isActiveUserParticipantOfConversation(conversationId) ? true : router.parseUrl(CONVERSATIONS_URL)))
  );
};
