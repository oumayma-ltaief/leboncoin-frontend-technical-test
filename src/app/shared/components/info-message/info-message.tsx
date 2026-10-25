interface InfoMessageProps {
  className?: string;
  description?: string;
  isCompact?: boolean;
  title: string;
}

function InfoIcon() {
  return (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z"
      />
    </svg>
  );
}

export function InfoMessage({ className = '', description, isCompact = false, title }: InfoMessageProps) {
  return (
    <div className={`flex ${className}`} role="status">
      {isCompact ? (
        <p className="flex items-center gap-1.5 text-sm font-medium text-content-secondary" title={description}>
          <span className="size-5 shrink-0 text-brand-strong">
            <InfoIcon />
          </span>
          {title}
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand-strong ring-8 ring-brand-soft">
            <span className="size-6">
              <InfoIcon />
            </span>
          </div>
          <h2 className="text-sm font-semibold text-content">{title}</h2>
          {description ? <p className="max-w-xs text-sm text-content-muted">{description}</p> : null}
        </div>
      )}
    </div>
  );
}
