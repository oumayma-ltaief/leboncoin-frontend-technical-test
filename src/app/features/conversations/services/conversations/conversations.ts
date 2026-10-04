import { API_URL } from '../../../../core/config/api.config';
import { Conversation } from '../../models/conversation/conversation.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { NewConversation } from '../../models/new-conversation/new-conversation.interface';

const CONVERSATIONS_API_PATH = '/conversations';

@Service()
export class Conversations {
  private readonly httpClient = inject(HttpClient);

  createConversation(newConversation: NewConversation): Observable<Conversation> {
    return this.httpClient
      .post<Pick<Conversation, 'id'>>(`${API_URL}${CONVERSATIONS_API_PATH}/${newConversation.senderId}`, newConversation)
      .pipe(map(({ id }) => ({ ...newConversation, id })));
  }

  getConversations(userId: number): Observable<Conversation[]> {
    return this.httpClient.get<Conversation[]>(`${API_URL}${CONVERSATIONS_API_PATH}/${userId}`);
  }
}
