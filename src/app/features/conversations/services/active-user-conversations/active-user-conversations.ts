import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { computed, inject, resource, Service } from '@angular/core';
import { Conversation } from '../../models/conversation/conversation.interface';
import { Conversations } from '../conversations/conversations';
import { dateToTimestamp } from '../../../../shared/utils/date-to-timestamp/date-to-timestamp';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { NewConversation } from '../../models/new-conversation/new-conversation.interface';
import { toAppError } from '../../../../core/errors/utils/to-app-error/to-app-error';
import { User } from '../../../../core/users/models/user/user.interface';
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

  createConversation(sender: User, recipient: User): Observable<Conversation> {
    return this.conversationsService
      .createConversation(this.buildNewConversation(sender, recipient))
      .pipe(tap((createdConversation) => this.addConversation(createdConversation)));
  }

  findConversationWith(user: User): Conversation | undefined {
    return this.conversationList().find((conversation) => conversation.senderId === user.id || conversation.recipientId === user.id);
  }

  isActiveUserParticipantOfConversation(conversationId: number): boolean {
    return this.conversationList().some((conversation) => conversation.id === conversationId);
  }

  reloadConversationList(): void {
    this.activeUserConversationsResource.reload();
  }

  private addConversation(conversation: Conversation): void {
    this.activeUserConversationsResource.set([...this.conversationList(), conversation]);
  }

  private buildNewConversation(sender: User, recipient: User): NewConversation {
    return {
      lastMessageTimestamp: dateToTimestamp(new Date()),
      recipientId: recipient.id,
      recipientNickname: recipient.nickname,
      senderId: sender.id,
      senderNickname: sender.nickname
    };
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
