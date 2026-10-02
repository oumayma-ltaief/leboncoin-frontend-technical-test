import { AppError, AppErrorKind } from '../../models/app-error/app-error';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

const HTTP_STATUS = {
  INTERNAL_SERVER_ERROR: 500,
  NETWORK_FAILURE: 0,
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503,
  UNAUTHORIZED: 401
} as const;

const ERROR_KIND_BY_HTTP_STATUS: Record<number, AppErrorKind> = {
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'server',
  [HTTP_STATUS.NETWORK_FAILURE]: 'network',
  [HTTP_STATUS.NOT_FOUND]: 'not-found',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'unavailable',
  [HTTP_STATUS.UNAUTHORIZED]: 'unauthorized'
};

function getErrorKind(error: unknown): AppErrorKind {
  if (error instanceof HttpErrorResponse) {
    return getHttpErrorKind(error);
  }
  return error instanceof TimeoutError ? 'unavailable' : 'unknown';
}

function getHttpErrorKind(httpError: HttpErrorResponse): AppErrorKind {
  return ERROR_KIND_BY_HTTP_STATUS[httpError.status] ?? 'unknown';
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(getErrorKind(error), { cause: error });
}
