import { act, renderHook } from '@testing-library/react';
import { clearCookies, readCookie } from '../../../../../test-providers';
import { DARK_THEME_COOKIE_NAME } from '../../../config/cookies.config';
import { renderToString } from 'react-dom/server';
import type { ThemeState } from '../../contexts/theme/theme';
import { useTheme } from '../../hooks/use-theme/use-theme';

import { ThemeProvider } from './theme-provider';

function ActiveThemeLabel() {
  const { isDarkThemeActive } = useTheme();
  return isDarkThemeActive ? 'dark' : 'light';
}

describe('ThemeProvider', () => {
  let theme: { current: ThemeState };

  function isDarkThemeApplied(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  function mockSystemThemePreference(isDarkThemePreferred: boolean): void {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: isDarkThemePreferred } as MediaQueryList);
  }

  function mockViewTransitionSupport(): void {
    document.startViewTransition = vi.fn((applyTheme: () => void) => {
      applyTheme();
    }) as unknown as Document['startViewTransition'];
  }

  function removeViewTransitionSupport(): void {
    delete (document as Partial<Document>).startViewTransition;
  }

  function startApp(): { current: ThemeState } {
    document.documentElement.classList.remove('dark');
    const savedTheme = readCookie(DARK_THEME_COOKIE_NAME);
    return renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider savedTheme={savedTheme}>{children}</ThemeProvider>
    }).result;
  }

  function toggleTheme(): void {
    act(() => {
      theme.current.toggleTheme();
    });
  }

  beforeEach(() => {
    clearCookies();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeViewTransitionSupport();
  });

  describe('Start with a theme', () => {
    describe('When no theme was chosen yet', () => {
      describe('When the system prefers light theme', () => {
        beforeEach(() => {
          mockSystemThemePreference(false);
        });

        it('should have light theme active', () => {
          theme = startApp();
          expect(theme.current.isDarkThemeActive).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
        });
      });

      describe('When the system prefers dark theme', () => {
        beforeEach(() => {
          mockSystemThemePreference(true);
        });

        it('should have dark theme active', () => {
          theme = startApp();
          expect(theme.current.isDarkThemeActive).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
        });

        it('should render light theme on the server, which cannot know the system preference', () => {
          const serverRenderedTheme = renderToString(
            <ThemeProvider savedTheme={undefined}>
              <ActiveThemeLabel />
            </ThemeProvider>
          );
          expect(serverRenderedTheme).toBe('light');
        });
      });
    });

    describe('When dark theme was chosen', () => {
      beforeEach(() => {
        mockSystemThemePreference(false);
        theme = startApp();
        toggleTheme();
      });

      describe('When the system prefers light theme', () => {
        it('should have dark theme active', () => {
          theme = startApp();
          expect(theme.current.isDarkThemeActive).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
        });
      });
    });

    describe('When light theme was chosen', () => {
      beforeEach(() => {
        mockSystemThemePreference(true);
        theme = startApp();
        toggleTheme();
      });

      describe('When the system prefers dark theme', () => {
        it('should have light theme active', () => {
          theme = startApp();
          expect(theme.current.isDarkThemeActive).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
        });
      });
    });
  });

  describe('Toggle theme', () => {
    beforeEach(() => {
      theme = startApp();
    });

    describe('When light theme is active', () => {
      describe('When the browser supports view transitions', () => {
        beforeEach(() => {
          mockViewTransitionSupport();
        });

        it('should switch to dark theme with a transition', () => {
          expect(theme.current.isDarkThemeActive).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
          expect(document.startViewTransition).not.toHaveBeenCalled();
          toggleTheme();
          expect(theme.current.isDarkThemeActive).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
          expect(document.startViewTransition).toHaveBeenCalledTimes(1);
        });
      });

      describe('When the browser does not support view transitions', () => {
        it('should switch to dark theme without transition', () => {
          expect(theme.current.isDarkThemeActive).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
          toggleTheme();
          expect(theme.current.isDarkThemeActive).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
        });
      });
    });

    describe('When dark theme is active', () => {
      beforeEach(() => {
        toggleTheme();
      });

      describe('When the browser supports view transitions', () => {
        beforeEach(() => {
          mockViewTransitionSupport();
        });

        it('should switch to light theme with a transition', () => {
          expect(theme.current.isDarkThemeActive).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
          expect(document.startViewTransition).not.toHaveBeenCalled();
          toggleTheme();
          expect(theme.current.isDarkThemeActive).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
          expect(document.startViewTransition).toHaveBeenCalledTimes(1);
        });
      });

      describe('When the browser does not support view transitions', () => {
        it('should switch to light theme without transition', () => {
          expect(theme.current.isDarkThemeActive).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
          toggleTheme();
          expect(theme.current.isDarkThemeActive).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
        });
      });
    });
  });
});
