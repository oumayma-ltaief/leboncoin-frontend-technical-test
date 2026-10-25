import type { AppError } from '../errors/models/app-error/app-error';
import type { QueryClientConfig } from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

export const QUERY_CLIENT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      gcTime: 0,
      retry: false,
      staleTime: Infinity
    }
  }
};
