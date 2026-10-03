import { API_URL } from '../../../../core/config/api.config';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Message } from '../../models/message/message.interface';
import { Observable } from 'rxjs';

const MESSAGES_API_PATH = '/messages';

@Service()
export class Messages {
  private readonly httpClient = inject(HttpClient);

  getMessages(conversationId: number): Observable<Message[]> {
    return this.httpClient.get<Message[]>(`${API_URL}${MESSAGES_API_PATH}/${conversationId}`);
  }
}
