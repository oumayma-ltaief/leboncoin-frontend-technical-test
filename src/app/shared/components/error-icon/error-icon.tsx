import type { AppErrorKind } from '../../../core/errors/models/app-error/app-error';

interface ErrorIconProps {
  className?: string;
  errorKind: AppErrorKind;
}

function ErrorIconPaths({ errorKind }: { errorKind: AppErrorKind }) {
  switch (errorKind) {
    case 'network':
      return (
        <>
          <path d="M1 1l22 22" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <path d="M12 20h.01" />
        </>
      );
    case 'not-found':
      return (
        <>
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </>
      );
    case 'server':
      return (
        <>
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <path d="M6 6h.01" />
          <path d="M6 18h.01" />
        </>
      );
    case 'unauthorized':
      return (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      );
    case 'unavailable':
      return (
        <>
          <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6" />
          <path d="M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
          <path d="M1 1l22 22" />
        </>
      );
    default:
      return (
        <>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      );
  }
}

export function ErrorIcon({ className = '', errorKind }: ErrorIconProps) {
  return (
    <span className={`inline-flex ${className}`} aria-hidden="true">
      <svg
        className="size-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ErrorIconPaths errorKind={errorKind} />
      </svg>
    </span>
  );
}
