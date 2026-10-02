import { AppError, AppErrorKind } from '../../models/app-error/app-error';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

import { toAppError } from './to-app-error';

describe('toAppError', () => {
  function expectAppErrorOfKind(expectedKind: AppErrorKind, receivedError: unknown): void {
    const appError = toAppError(receivedError);
    expect(appError.kind).toBe(expectedKind);
    expect(appError.cause).toBe(receivedError);
  }

  describe('When the received error is already an app error', () => {
    it('should return it untouched', () => {
      const appError = new AppError('server');
      expect(toAppError(appError)).toBe(appError);
    });
  });

  describe('When the received error is an http error', () => {
    it('should convert it to the app error of its status kind, keeping it as cause since its status is known', () => {
      const notFoundHttpError = new HttpErrorResponse({ status: 404 });
      expectAppErrorOfKind('not-found', notFoundHttpError);
    });

    it('should convert it to an unknown app error, keeping it as cause since its status is not known', () => {
      const unknownStatusHttpError = new HttpErrorResponse({ status: 418 });
      expectAppErrorOfKind('unknown', unknownStatusHttpError);
    });
  });

  describe('When the received error is a request timeout', () => {
    it('should convert it to an unavailable app error and keep it as cause', () => {
      const requestTimeoutError = new TimeoutError();
      expectAppErrorOfKind('unavailable', requestTimeoutError);
    });
  });

  describe('When the received error is anything else', () => {
    it('should convert it to an unknown app error and keep it as cause', () => {
      const unexpectedError = new Error('Unexpected');
      expectAppErrorOfKind('unknown', unexpectedError);
    });
  });
});
