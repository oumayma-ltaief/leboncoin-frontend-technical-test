import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { AppError } from '../../../../core/errors/models/app-error/app-error';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Conversation } from '../../models/conversation/conversation.interface';
import { ConversationRecipientDialog } from '../conversation-recipient-dialog/conversation-recipient-dialog';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { toAppError } from '../../../../core/errors/utils/to-app-error/to-app-error';
import { User } from '../../../../core/users/models/user/user.interface';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

interface ConversationCreationFailure {
  error: AppError;
  recipient: User;
}

@Component({
  imports: [ConversationRecipientDialog, ErrorMessage],
  selector: 'app-new-conversation',
  styleUrl: './new-conversation.css',
  templateUrl: './new-conversation.html'
})
export class NewConversation {
  private readonly activeUserConversations = inject(ActiveUserConversations);
  private readonly router = inject(Router);
  private readonly userSession = inject(UserSession);

  readonly activeUser = input.required<User>();

  private readonly conversationRecipientDialog = viewChild.required<ConversationRecipientDialog>('conversationRecipientDialog');

  protected readonly recipientList = computed(() => this.userSession.userList().filter((user) => user.id !== this.activeUser().id));
  protected readonly isCreatingConversation = signal(false);
  protected readonly conversationCreationFailure = signal<ConversationCreationFailure | undefined>(undefined);

  openConversationRecipientDialog(): void {
    this.conversationCreationFailure.set(undefined);
    this.conversationRecipientDialog().openDialog();
  }

  startConversationWith(recipient: User): void {
    const existingConversation = this.activeUserConversations.findConversationWith(recipient);
    if (existingConversation) {
      this.openConversation(existingConversation);
    } else {
      this.createConversationWith(recipient);
    }
  }

  private createConversationWith(recipient: User): void {
    this.conversationCreationFailure.set(undefined);
    this.isCreatingConversation.set(true);
    this.activeUserConversations
      .createConversation(this.activeUser(), recipient)
      .pipe(finalize(() => this.isCreatingConversation.set(false)))
      .subscribe({
        next: (createdConversation) => this.openConversation(createdConversation),
        error: (error: unknown) => this.conversationCreationFailure.set({ error: toAppError(error), recipient })
      });
  }

  private openConversation(conversation: Conversation): void {
    this.conversationRecipientDialog().closeDialog();
    this.router.navigate([CONVERSATIONS_URL, conversation.id]);
  }
}
