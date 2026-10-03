import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { firstValueFrom } from 'rxjs';
import { groupMessagesByDay } from '../../utils/group-messages-by-day/group-messages-by-day';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { Message } from '../../models/message/message.interface';
import { MessageDateSeparator } from '../../components/message-date-separator/message-date-separator';
import { MessageItem } from '../../components/message-item/message-item';
import { Messages } from '../../services/messages/messages';
import { RouterLink } from '@angular/router';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { toAppError } from '../../../../core/errors/utils/to-app-error/to-app-error';

@Component({
  imports: [ErrorMessage, InfoMessage, MessageDateSeparator, MessageItem, RouterLink, Skeleton],
  selector: 'app-conversation-detail',
  styleUrl: './conversation-detail.css',
  templateUrl: './conversation-detail.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' }
})
export class ConversationDetail {
  private readonly messagesService = inject(Messages);

  readonly conversationId = input.required({ alias: 'id', transform: numberAttribute });

  private readonly conversationMessagesResource = resource({
    params: () => this.conversationId(),
    loader: ({ params: conversationId }) => firstValueFrom(this.messagesService.getMessages(conversationId))
  });

  protected readonly conversationListUrl = CONVERSATIONS_URL;
  protected readonly messageList = computed(() => {
    const conversationMessages = this.conversationMessagesResource.hasValue() ? this.conversationMessagesResource.value() : [];
    return this.sortMessagesByOldestFirst(conversationMessages);
  });
  protected readonly dailyMessageList = computed(() => groupMessagesByDay(this.messageList()));
  protected readonly isLoadingMessageList = this.conversationMessagesResource.isLoading;
  protected readonly messageListLoadingError = computed<AppError | undefined>(() => {
    const error = this.conversationMessagesResource.error();
    return this.isMessageListLoadingFailure(error) ? toAppError(error) : undefined;
  });

  reloadMessageList(): void {
    this.conversationMessagesResource.reload();
  }

  private isMessageListLoadingFailure(error: Error | undefined): boolean {
    return !!error && !this.isNoMessageFoundError(error);
  }

  private isNoMessageFoundError(error: Error): boolean {
    return toAppError(error).kind === 'not-found';
  }

  private sortMessagesByOldestFirst(messages: Message[]): Message[] {
    return [...messages].sort((message, nextMessage) => message.timestamp - nextMessage.timestamp);
  }
}
