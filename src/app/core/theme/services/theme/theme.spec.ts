import { TestBed } from '@angular/core/testing';

import { Theme } from './theme';

describe('Theme', () => {
  let theme: Theme;

  function isDarkThemeApplied(): boolean {
    return document.documentElement.classList.contains('dark');
  }

  function mockSystemThemePreference(isDarkThemePreferred: boolean): void {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: isDarkThemePreferred } as MediaQueryList);
  }

  function mockViewTransitionSupport(): void {
    document.startViewTransition = vi.fn((applyTheme: () => void) => applyTheme()) as unknown as Document['startViewTransition'];
  }

  function removeViewTransitionSupport(): void {
    delete (document as Partial<Document>).startViewTransition;
  }

  function startApp(): Theme {
    document.documentElement.classList.remove('dark');
    return TestBed.runInInjectionContext(() => new Theme());
  }

  beforeEach(() => {
    localStorage.clear();
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
          expect(theme.isDarkThemeActive()).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
        });
      });

      describe('When the system prefers dark theme', () => {
        beforeEach(() => {
          mockSystemThemePreference(true);
        });

        it('should have dark theme active', () => {
          theme = startApp();
          expect(theme.isDarkThemeActive()).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
        });
      });
    });

    describe('When dark theme was chosen', () => {
      beforeEach(() => {
        mockSystemThemePreference(false);
        startApp().toggleTheme();
      });

      describe('When the system prefers light theme', () => {
        it('should have dark theme active', () => {
          theme = startApp();
          expect(theme.isDarkThemeActive()).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
        });
      });
    });

    describe('When light theme was chosen', () => {
      beforeEach(() => {
        mockSystemThemePreference(true);
        startApp().toggleTheme();
      });

      describe('When the system prefers dark theme', () => {
        it('should have light theme active', () => {
          theme = startApp();
          expect(theme.isDarkThemeActive()).toBe(false);
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
          expect(theme.isDarkThemeActive()).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
          expect(document.startViewTransition).not.toHaveBeenCalled();
          theme.toggleTheme();
          expect(theme.isDarkThemeActive()).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
          expect(document.startViewTransition).toHaveBeenCalledTimes(1);
        });
      });

      describe('When the browser does not support view transitions', () => {
        it('should switch to dark theme without transition', () => {
          expect(theme.isDarkThemeActive()).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
          theme.toggleTheme();
          expect(theme.isDarkThemeActive()).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
        });
      });
    });

    describe('When dark theme is active', () => {
      beforeEach(() => {
        theme.toggleTheme();
      });

      describe('When the browser supports view transitions', () => {
        beforeEach(() => {
          mockViewTransitionSupport();
        });

        it('should switch to light theme with a transition', () => {
          expect(theme.isDarkThemeActive()).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
          expect(document.startViewTransition).not.toHaveBeenCalled();
          theme.toggleTheme();
          expect(theme.isDarkThemeActive()).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
          expect(document.startViewTransition).toHaveBeenCalledTimes(1);
        });
      });

      describe('When the browser does not support view transitions', () => {
        it('should switch to light theme without transition', () => {
          expect(theme.isDarkThemeActive()).toBe(true);
          expect(isDarkThemeApplied()).toBe(true);
          theme.toggleTheme();
          expect(theme.isDarkThemeActive()).toBe(false);
          expect(isDarkThemeApplied()).toBe(false);
        });
      });
    });
  });
});
