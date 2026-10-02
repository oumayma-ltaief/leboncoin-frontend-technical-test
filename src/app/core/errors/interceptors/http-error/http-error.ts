import { catchError, throwError, timeout } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { toAppError } from '../../utils/to-app-error/to-app-error';

export const REQUEST_TIMEOUT_MILLISECONDS = 10_000;

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    timeout(REQUEST_TIMEOUT_MILLISECONDS),
    catchError((error: unknown) => throwError(() => toAppError(error)))
  );
