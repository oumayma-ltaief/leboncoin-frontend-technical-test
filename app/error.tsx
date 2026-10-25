'use client';

import { ErrorMessage } from '../src/app/shared/components/error-message/error-message';
import { toAppError } from '../src/app/core/errors/utils/to-app-error/to-app-error';

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const appError = toAppError(error);

  return <ErrorMessage className="h-full" title="Something went wrong" error={appError} onRetry={retry} />;
}
