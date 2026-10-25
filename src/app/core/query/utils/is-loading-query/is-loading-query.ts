import type { UseQueryResult } from '@tanstack/react-query';

type QueryLoadingState = Pick<UseQueryResult, 'isError' | 'isFetching' | 'isPending'>;

export function isLoadingQuery(query: QueryLoadingState, isQueryEnabled = true): boolean {
  const isWaitingForFirstAnswer = query.isPending && isQueryEnabled;
  const isRetryingAfterError = query.isError && query.isFetching;
  return isWaitingForFirstAnswer || isRetryingAfterError;
}
