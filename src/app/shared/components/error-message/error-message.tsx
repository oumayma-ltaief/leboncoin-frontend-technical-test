import type { AppError } from '../../../core/errors/models/app-error/app-error';
import { ErrorIcon } from '../error-icon/error-icon';

interface ErrorMessageProps {
  className?: string;
  error: AppError;
  isCompact?: boolean;
  onRetry: () => void;
  title: string;
}

export function ErrorMessage({ className = '', error, isCompact = false, onRetry, title }: ErrorMessageProps) {
  return (
    <div className={`flex ${className}`} role="alert">
      {isCompact ? (
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-danger" title={error.message}>
            <ErrorIcon className="size-5 shrink-0" errorKind={error.kind} />
            <span className="sr-only sm:not-sr-only @xs:not-sr-only">{title}</span>
            <span className="sr-only">{error.message}</span>
          </p>
          <button type="button" className="button-primary" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger ring-8 ring-danger-subtle">
            <ErrorIcon className="size-6" errorKind={error.kind} />
          </div>
          <h2 className="text-sm font-semibold text-content">{title}</h2>
          <p className="max-w-xs text-sm text-content-muted">{error.message}</p>
          <button type="button" className="button-primary mt-2" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
