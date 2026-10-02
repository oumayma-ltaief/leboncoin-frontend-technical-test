import { API_URL } from '../../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user/user.interface';

const USERS_API_PATH = '/users';

@Service()
export class Users {
  private readonly httpClient = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${API_URL}${USERS_API_PATH}`);
  }
}
