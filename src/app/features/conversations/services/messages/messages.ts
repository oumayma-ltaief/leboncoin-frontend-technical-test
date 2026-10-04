import { API_URL } from '../../../../core/config/api.config';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Message } from '../../models/message/message.interface';
import { NewMessage } from '../../models/new-message/new-message.interface';

const MESSAGES_API_PATH = '/messages';

@Service()
export class Messages {
  private readonly httpClient = inject(HttpClient);

  createMessage(newMessage: NewMessage): Observable<Message> {
    return this.httpClient
      .post<Pick<Message, 'id'>>(`${API_URL}${MESSAGES_API_PATH}/${newMessage.conversationId}`, newMessage)
      .pipe(map(({ id }) => ({ ...newMessage, id })));
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.httpClient.get<Message[]>(`${API_URL}${MESSAGES_API_PATH}/${conversationId}`);
  }
}
