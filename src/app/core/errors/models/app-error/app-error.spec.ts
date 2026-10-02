import { APP_ERROR_MESSAGES, AppError } from './app-error';

describe('AppError', () => {
  it('should carry its kind, the user-facing message of that kind and the original cause', () => {
    const cause = new Error('Service unavailable');
    const appError = new AppError('server', { cause });
    expect(appError).toBeInstanceOf(Error);
    expect(appError.kind).toBe('server');
    expect(appError.message).toBe(APP_ERROR_MESSAGES.server);
    expect(appError.cause).toBe(cause);
  });
});
