import { Component, computed, inject, input } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Message } from '../../models/message/message.interface';
import { timestampToDate } from '../../../../shared/utils/timestamp-to-date/timestamp-to-date';
import { UserSession } from '../../../../core/users/services/user-session/user-session';

const ACTIVE_USER_AUTHOR_LABEL = 'You';
const UNKNOWN_AUTHOR_LABEL = 'Unknown user';

@Component({
  imports: [DatePipe, UpperCasePipe],
  selector: 'app-message-item',
  styleUrl: './message-item.css',
  templateUrl: './message-item.html',
  host: { class: 'flex flex-col', '[class]': 'messageSideClass()' }
})
export class MessageItem {
  private readonly userSession = inject(UserSession);

  readonly message = input.required<Message>();

  protected readonly isSentByActiveUser = computed(() => this.message().authorId === this.userSession.activeUser()?.id);
  protected readonly authorNickname = computed(() => (this.isSentByActiveUser() ? ACTIVE_USER_AUTHOR_LABEL : this.getOtherAuthorNickname()));
  protected readonly messageSideClass = computed(() => (this.isSentByActiveUser() ? 'items-end' : 'items-start'));
  protected readonly sendingDate = computed(() => timestampToDate(this.message().timestamp));

  private getOtherAuthorNickname(): string {
    const author = this.userSession.userList().find((user) => user.id === this.message().authorId);
    return author?.nickname ?? UNKNOWN_AUTHOR_LABEL;
  }
}
