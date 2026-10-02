import { Component, inject } from '@angular/core';
import { ErrorMessage } from '../../shared/components/error-message/error-message';
import { InfoMessage } from '../../shared/components/info-message/info-message';
import { Skeleton } from '../../shared/components/skeleton/skeleton';
import { UserSession } from '../../core/users/services/user-session/user-session';

@Component({
  imports: [ErrorMessage, InfoMessage, Skeleton],
  selector: 'app-user-selector',
  styleUrl: './user-selector.css',
  templateUrl: './user-selector.html'
})
export class UserSelector {
  private readonly userSession = inject(UserSession);

  protected readonly userList = this.userSession.userList;
  protected readonly isLoadingUserList = this.userSession.isLoadingUserList;
  protected readonly userListLoadingError = this.userSession.userListLoadingError;
  protected readonly activeUser = this.userSession.activeUser;

  reloadUserList(): void {
    this.userSession.reloadUserList();
  }

  selectUser(userSelectionEvent: Event): void {
    const userId = Number((userSelectionEvent.target as HTMLSelectElement).value);
    this.userSession.setActiveUser(userId);
  }
}
