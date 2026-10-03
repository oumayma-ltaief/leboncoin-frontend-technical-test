import { API_URL } from '../../../../core/config/api.config';
import { Conversation } from '../../models/conversation/conversation.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

const CONVERSATIONS_API_PATH = '/conversations';

@Service()
export class Conversations {
  private readonly httpClient = inject(HttpClient);

  getConversations(userId: number): Observable<Conversation[]> {
    return this.httpClient.get<Conversation[]>(`${API_URL}${CONVERSATIONS_API_PATH}/${userId}`);
  }
}
