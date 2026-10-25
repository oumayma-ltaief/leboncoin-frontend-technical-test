'use client';

import { useTheme } from '../../core/theme/hooks/use-theme/use-theme';

export function ThemeToggle() {
  const { isDarkThemeActive, toggleTheme } = useTheme();

  const toggleLabel = `Switch to ${isDarkThemeActive ? 'light' : 'dark'} theme`;

  return (
    <button
      type="button"
      className="flex size-10 cursor-pointer items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
      aria-label={toggleLabel}
      title={toggleLabel}
      onClick={toggleTheme}
    >
      <span className={`flex motion-safe:transition-transform motion-safe:duration-500 ${isDarkThemeActive ? 'rotate-180' : ''}`}>
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isDarkThemeActive ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </>
          ) : (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          )}
        </svg>
      </span>
    </button>
  );
}
