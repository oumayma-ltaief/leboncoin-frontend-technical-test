import { API_URL } from '../../../config/api.config';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '../../models/user/user.interface';

import { Users } from './users';

describe('Users', () => {
  let httpTestingController: HttpTestingController;
  let userList: User[];
  let users: Users;

  function initMocks() {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
  }

  beforeEach(() => {
    initMocks();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    users = TestBed.inject(Users);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Get users', () => {
    let usersUrl: string;

    beforeEach(() => {
      usersUrl = `${API_URL}/users`;
    });

    it('should handle loading user list successfully', () => {
      let receivedUserList: User[] | undefined;
      users.getUsers().subscribe({ next: (usersResponse: User[]) => (receivedUserList = usersResponse) });
      const usersRequest = httpTestingController.expectOne(usersUrl);
      expect(usersRequest.request.method).toBe('GET');
      expect(receivedUserList).toBeUndefined();
      usersRequest.flush(userList);
      expect(receivedUserList).toEqual(userList);
    });

    it('should handle loading user list with error', () => {
      let receivedError: HttpErrorResponse | undefined;
      users.getUsers().subscribe({ error: (httpError: HttpErrorResponse) => (receivedError = httpError) });
      const usersRequest = httpTestingController.expectOne(usersUrl);
      expect(usersRequest.request.method).toBe('GET');
      expect(receivedError).toBeUndefined();
      usersRequest.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
      expect(receivedError?.status).toBe(503);
    });
  });
});
