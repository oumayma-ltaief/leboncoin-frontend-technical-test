import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { Component, computed, inject, input, linkedSignal, numberAttribute, resource } from '@angular/core';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import { dateToTimestamp } from '../../../../shared/utils/date-to-timestamp/date-to-timestamp';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { finalize, firstValueFrom } from 'rxjs';
import { groupMessagesByDay } from '../../utils/group-messages-by-day/group-messages-by-day';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { Message } from '../../models/message/message.interface';
import { MessageDateSeparator } from '../../components/message-date-separator/message-date-separator';
import { MessageForm } from '../../components/message-form/message-form';
import { MessageItem } from '../../components/message-item/message-item';
import { Messages } from '../../services/messages/messages';
import { NewMessage } from '../../models/new-message/new-message.interface';
import { RouterLink } from '@angular/router';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { toAppError } from '../../../../core/errors/utils/to-app-error/to-app-error';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

interface MessageSendingFailure {
  error: AppError;
  messageBody: string;
}

@Component({
  imports: [ErrorMessage, InfoMessage, MessageDateSeparator, MessageForm, MessageItem, RouterLink, Skeleton],
  selector: 'app-conversation-detail',
  styleUrl: './conversation-detail.css',
  templateUrl: './conversation-detail.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' }
})
export class ConversationDetail {
  private readonly messagesService = inject(Messages);
  private readonly userSession = inject(UserSession);

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
  private readonly messageSendingContext = computed(() => ({ authorId: this.userSession.activeUser()?.id, conversationId: this.conversationId() }));
  private readonly messageBeingSent = linkedSignal({
    source: this.messageSendingContext,
    computation: (): NewMessage | undefined => undefined
  });

  protected readonly isSendingMessage = computed(() => !!this.messageBeingSent());
  protected readonly messageSendingFailure = linkedSignal({
    source: this.messageSendingContext,
    computation: (): MessageSendingFailure | undefined => undefined
  });
  protected readonly isMessageSendingDisabled = computed(
    () => this.isSendingMessage() || !!this.messageSendingFailure() || this.isLoadingMessageList() || !!this.messageListLoadingError()
  );

  reloadMessageList(): void {
    this.conversationMessagesResource.reload();
  }

  sendMessage(messageBody: string): void {
    const newMessage = this.buildNewMessage(messageBody);
    this.messageSendingFailure.set(undefined);
    this.messageBeingSent.set(newMessage);
    this.messagesService
      .createMessage(newMessage)
      .pipe(finalize(() => this.endMessageSending(newMessage)))
      .subscribe({
        next: (sentMessage) => this.addSentMessage(sentMessage),
        error: (error: unknown) => this.reportMessageSendingFailure(error, newMessage)
      });
  }

  private addSentMessage(sentMessage: Message): void {
    if (this.isMessageOfOpenConversation(sentMessage) && !this.isLoadingMessageList() && !this.isMessageAlreadyListed(sentMessage)) {
      this.conversationMessagesResource.set([...this.messageList(), sentMessage]);
    }
  }

  private buildNewMessage(messageBody: string): NewMessage {
    return {
      authorId: this.getMessageAuthor().id,
      body: messageBody,
      conversationId: this.conversationId(),
      timestamp: dateToTimestamp(new Date())
    };
  }

  private endMessageSending(message: NewMessage): void {
    if (this.messageBeingSent() === message) {
      this.messageBeingSent.set(undefined);
    }
  }

  private getMessageAuthor(): User {
    return this.userSession.activeUser()!;
  }

  private isMessageAlreadyListed(message: Message): boolean {
    return this.messageList().some((listedMessage) => listedMessage.id === message.id);
  }

  private isMessageListLoadingFailure(error: Error | undefined): boolean {
    return !!error && !this.isNoMessageFoundError(error);
  }

  private isMessageOfOpenConversation(message: NewMessage): boolean {
    return message.conversationId === this.conversationId();
  }

  private isNoMessageFoundError(error: Error): boolean {
    return toAppError(error).kind === 'not-found';
  }

  private reportMessageSendingFailure(error: unknown, failedMessage: NewMessage): void {
    if (this.isMessageOfOpenConversation(failedMessage)) {
      this.messageSendingFailure.set({ error: toAppError(error), messageBody: failedMessage.body });
    }
  }

  private sortMessagesByOldestFirst(messages: Message[]): Message[] {
    return [...messages].sort((message, nextMessage) => message.timestamp - nextMessage.timestamp);
  }
}
