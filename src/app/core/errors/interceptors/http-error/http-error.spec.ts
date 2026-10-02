import { AppError } from '../../models/app-error/app-error';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TimeoutError } from 'rxjs';

import { httpErrorInterceptor, REQUEST_TIMEOUT_MILLISECONDS } from './http-error';

describe('httpErrorInterceptor', () => {
  const RESOURCE_URL = '/resource';
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpErrorInterceptor])), provideHttpClientTesting()]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.useRealTimers();
  });

  it('should let a successful response through', () => {
    let response: unknown;
    httpClient.get(RESOURCE_URL).subscribe((body) => (response = body));
    expect(response).toBeUndefined();
    httpTestingController.expectOne(RESOURCE_URL).flush({ id: 1 });
    expect(response).toEqual({ id: 1 });
  });

  it('should rethrow a failed response as an app error keeping the http error as cause', () => {
    let thrownError: unknown;
    httpClient.get(RESOURCE_URL).subscribe({ error: (error: unknown) => (thrownError = error) });
    expect(thrownError).toBeUndefined();
    httpTestingController.expectOne(RESOURCE_URL).flush(null, { status: 500, statusText: 'Internal Server Error' });
    expect(thrownError).toBeInstanceOf(AppError);
    expect((thrownError as AppError).cause).toBeInstanceOf(HttpErrorResponse);
  });

  it('should rethrow a request left unanswered for too long as an app error keeping the timeout error as cause', () => {
    const millisecondsBeforeTimeout = REQUEST_TIMEOUT_MILLISECONDS - 1;
    vi.useFakeTimers();
    let thrownError: unknown;
    httpClient.get(RESOURCE_URL).subscribe({ error: (error: unknown) => (thrownError = error) });
    httpTestingController.expectOne(RESOURCE_URL);
    vi.advanceTimersByTime(millisecondsBeforeTimeout);
    expect(thrownError).toBeUndefined();
    vi.advanceTimersByTime(REQUEST_TIMEOUT_MILLISECONDS - millisecondsBeforeTimeout);
    expect(thrownError).toBeInstanceOf(AppError);
    expect((thrownError as AppError).cause).toBeInstanceOf(TimeoutError);
  });
});
