export type AppErrorKind = 'network' | 'not-found' | 'server' | 'unauthorized' | 'unavailable' | 'unknown';

export const APP_ERROR_MESSAGES: Record<AppErrorKind, string> = {
  network: "Can't reach the server. Check your connection.",
  'not-found': "We couldn't find what you were looking for.",
  server: 'Something went wrong on our side. Please try again.',
  unauthorized: "You're not allowed to access this. Please sign in again.",
  unavailable: 'The service is temporarily unavailable. Please try again in a moment.',
  unknown: 'Something went wrong. Please try again.'
};

export class AppError extends Error {
  constructor(
    readonly kind: AppErrorKind,
    options?: ErrorOptions
  ) {
    super(APP_ERROR_MESSAGES[kind], options);
  }
}
