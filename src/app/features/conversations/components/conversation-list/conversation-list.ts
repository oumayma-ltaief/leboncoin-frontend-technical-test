import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { Component, computed, inject } from '@angular/core';
import { ConversationItem } from '../conversation-item/conversation-item';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

@Component({
  imports: [ConversationItem, ErrorMessage, InfoMessage, Skeleton],
  selector: 'app-conversation-list',
  styleUrl: './conversation-list.css',
  templateUrl: './conversation-list.html',
  host: { class: 'flex flex-col' }
})
export class ConversationList {
  private readonly activeUserConversations = inject(ActiveUserConversations);
  private readonly userSession = inject(UserSession);

  protected readonly isLoading = computed(() => this.userSession.isLoadingUserList() || this.activeUserConversations.isLoadingConversationList());
  protected readonly activeUser = this.userSession.activeUser;
  protected readonly conversationListLoadingError = this.activeUserConversations.conversationListLoadingError;
  protected readonly conversationList = this.activeUserConversations.conversationList;

  reloadConversationList(): void {
    this.activeUserConversations.reloadConversationList();
  }
}
