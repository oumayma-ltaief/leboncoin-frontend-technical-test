import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { computed, inject, resource, Service } from '@angular/core';
import { Conversation } from '../../models/conversation/conversation.interface';
import { Conversations } from '../conversations/conversations';
import { firstValueFrom } from 'rxjs';
import { toAppError } from '../../../../core/errors/utils/to-app-error/to-app-error';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

@Service()
export class ActiveUserConversations {
  private readonly conversationsService = inject(Conversations);
  private readonly userSession = inject(UserSession);
  private readonly activeUserConversationsResource = resource({
    params: () => this.userSession.activeUser()?.id,
    loader: ({ params: activeUserId }) => firstValueFrom(this.conversationsService.getConversations(activeUserId))
  });

  readonly conversationList = computed(() => {
    const activeUserConversations = this.activeUserConversationsResource.hasValue() ? this.activeUserConversationsResource.value() : [];
    return this.sortConversationsByMostRecentMessage(activeUserConversations);
  });
  readonly isLoadingConversationList = this.activeUserConversationsResource.isLoading;
  readonly conversationListLoadingError = computed<AppError | undefined>(() => {
    const error = this.activeUserConversationsResource.error();
    return this.isConversationListLoadingFailure(error) ? toAppError(error) : undefined;
  });

  isActiveUserParticipantOfConversation(conversationId: number): boolean {
    return this.conversationList().some((conversation) => conversation.id === conversationId);
  }

  reloadConversationList(): void {
    this.activeUserConversationsResource.reload();
  }

  private isConversationListLoadingFailure(error: Error | undefined): boolean {
    return !!error && !this.isNoConversationFoundError(error);
  }

  private isNoConversationFoundError(error: Error): boolean {
    return toAppError(error).kind === 'not-found';
  }

  private sortConversationsByMostRecentMessage(conversations: Conversation[]): Conversation[] {
    return [...conversations].sort((conversation, nextConversation) => nextConversation.lastMessageTimestamp - conversation.lastMessageTimestamp);
  }
}
