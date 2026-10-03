import { Component, computed, input } from '@angular/core';
import { Conversation } from '../../models/conversation/conversation.interface';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

const MILLISECONDS_PER_SECOND = 1000;

@Component({
  imports: [DatePipe, RouterLink, RouterLinkActive, UpperCasePipe],
  selector: 'app-conversation-item',
  styleUrl: './conversation-item.css',
  templateUrl: './conversation-item.html',
  host: { class: 'block' }
})
export class ConversationItem {
  readonly activeUserId = input.required<number>();
  readonly conversation = input.required<Conversation>();

  private readonly isActiveUserSender = computed(() => this.conversation().senderId === this.activeUserId());

  protected readonly contactNickname = computed(() =>
    this.isActiveUserSender() ? this.conversation().recipientNickname : this.conversation().senderNickname
  );
  protected readonly conversationUrl = computed(() => [CONVERSATIONS_URL, this.conversation().id]);
  protected readonly lastMessageDate = computed(() => new Date(this.conversation().lastMessageTimestamp * MILLISECONDS_PER_SECOND));
}
