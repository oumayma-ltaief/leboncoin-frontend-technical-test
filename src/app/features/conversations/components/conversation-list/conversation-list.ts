import { Component, inject } from '@angular/core';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

@Component({
  imports: [InfoMessage, Skeleton],
  selector: 'app-conversation-list',
  styleUrl: './conversation-list.css',
  templateUrl: './conversation-list.html',
  host: { class: 'flex flex-col' }
})
export class ConversationList {
  private readonly userSession = inject(UserSession);

  protected readonly activeUser = this.userSession.activeUser;
  protected readonly isLoadingUserList = this.userSession.isLoadingUserList;
}
