import { API_URL } from '../../../config/api.config';
import type { AppError } from '../../../errors/models/app-error/app-error';
import type { MockInstance } from 'vitest';
import type { User } from '../../models/user/user';

import { Users } from './users';

describe('Users', () => {
  let fetchResponse: PromiseWithResolvers<Response>;
  let fetchSpy: MockInstance<typeof fetch>;
  let userList: User[];

  function initMocks() {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    fetchResponse = Promise.withResolvers<Response>();
  }

  beforeEach(() => {
    initMocks();
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchResponse.promise);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Get users', () => {
    let usersUrl: string;

    beforeEach(() => {
      usersUrl = `${API_URL}/users`;
    });

    it('should handle loading user list successfully', async () => {
      let receivedUserList: User[] | undefined;
      const usersRequest = Users.getUsers().then((usersResponse: User[]) => (receivedUserList = usersResponse));
      expect(fetchSpy).toHaveBeenCalledWith(usersUrl, expect.objectContaining({ method: 'GET' }));
      expect(receivedUserList).toBeUndefined();
      fetchResponse.resolve(Response.json(userList));
      await usersRequest;
      expect(receivedUserList).toEqual(userList);
    });

    it('should handle loading user list with error', async () => {
      let receivedError: AppError | undefined;
      const usersRequest = Users.getUsers().catch((error: unknown) => (receivedError = error as AppError));
      expect(fetchSpy).toHaveBeenCalledWith(usersUrl, expect.objectContaining({ method: 'GET' }));
      expect(receivedError).toBeUndefined();
      fetchResponse.resolve(new Response('Service unavailable', { status: 503, statusText: 'Service Unavailable' }));
      await usersRequest;
      expect(receivedError?.kind).toBe('unavailable');
    });
  });
});
