import { API_URL } from '../../../config/api.config';
import { getJson } from '../../../http/services/http-client/http-client';
import type { User } from '../../models/user/user';

const USERS_API_PATH = '/users';

export const Users = {
  getUsers(): Promise<User[]> {
    return getJson<User[]>(`${API_URL}${USERS_API_PATH}`);
  }
};
