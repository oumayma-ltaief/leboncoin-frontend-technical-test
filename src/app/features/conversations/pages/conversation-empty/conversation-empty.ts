import { ActiveUserConversations } from '../../services/active-user-conversations/active-user-conversations';
import { Component, computed, inject } from '@angular/core';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';

@Component({
  imports: [InfoMessage],
  selector: 'app-conversation-empty',
  styleUrl: './conversation-empty.css',
  templateUrl: './conversation-empty.html',
  host: { class: 'flex flex-1' }
})
export class ConversationEmpty {
  private readonly activeUserConversations = inject(ActiveUserConversations);

  protected readonly hasConversationToSelect = computed(() => this.activeUserConversations.conversationList().length);
}
