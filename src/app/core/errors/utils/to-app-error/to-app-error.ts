import { AppError, type AppErrorKind } from '../../models/app-error/app-error';
import { HttpError } from '../../models/http-error/http-error';

const HTTP_STATUS = {
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503,
  UNAUTHORIZED: 401
} as const;

const ERROR_KIND_BY_HTTP_STATUS: Record<number, AppErrorKind> = {
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'server',
  [HTTP_STATUS.NOT_FOUND]: 'not-found',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'unavailable',
  [HTTP_STATUS.UNAUTHORIZED]: 'unauthorized'
};

const TIMEOUT_ERROR_NAME = 'TimeoutError';

function getErrorKind(error: unknown): AppErrorKind {
  if (error instanceof HttpError) {
    return getHttpErrorKind(error);
  }
  if (isNetworkFailure(error)) {
    return 'network';
  }
  return isTimeoutError(error) ? 'unavailable' : 'unknown';
}

function getHttpErrorKind(httpError: HttpError): AppErrorKind {
  return ERROR_KIND_BY_HTTP_STATUS[httpError.status] ?? 'unknown';
}

function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError;
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && error.name === TIMEOUT_ERROR_NAME;
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(getErrorKind(error), { cause: error });
}
