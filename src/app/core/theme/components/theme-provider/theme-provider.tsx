'use client';

import { DARK_THEME_COOKIE_NAME } from '../../../config/cookies.config';
import { flushSync } from 'react-dom';
import { type ReactNode, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { storeCookie } from '../../../storage/utils/browser-cookie/browser-cookie';
import { ThemeContext } from '../../contexts/theme/theme';

interface ThemeProviderProps {
  children: ReactNode;
  savedTheme: string | undefined;
}

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const DARK_THEME_CLASS = 'dark';

function applyWithTransition(applyTheme: () => void): void {
  if (isViewTransitionSupported()) {
    document.startViewTransition(applyTheme);
  } else {
    applyTheme();
  }
}

function isDarkThemePreferredBySystem(): boolean {
  return window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;
}

function isDarkThemePreferredOnServer(): boolean {
  return false;
}

function isViewTransitionSupported(): boolean {
  return 'startViewTransition' in document;
}

function subscribeToNothing(): () => void {
  return () => undefined;
}

function toChosenTheme(savedTheme: string | undefined): boolean | undefined {
  return savedTheme === undefined ? undefined : savedTheme === String(true);
}

export function ThemeProvider({ children, savedTheme }: ThemeProviderProps) {
  const [isDarkThemeChosen, setIsDarkThemeChosen] = useState(() => toChosenTheme(savedTheme));
  const isDarkThemePreferred = useSyncExternalStore(subscribeToNothing, isDarkThemePreferredBySystem, isDarkThemePreferredOnServer);

  const isDarkThemeActive = isDarkThemeChosen ?? isDarkThemePreferred;

  useLayoutEffect(() => {
    document.documentElement.classList.toggle(DARK_THEME_CLASS, isDarkThemeActive);
  }, [isDarkThemeActive]);

  function toggleTheme(): void {
    const isDarkThemeNowChosen = !isDarkThemeActive;
    applyWithTransition(() => {
      flushSync(() => {
        setIsDarkThemeChosen(isDarkThemeNowChosen);
      });
    });
    storeCookie(DARK_THEME_COOKIE_NAME, String(isDarkThemeNowChosen));
  }

  return <ThemeContext value={{ isDarkThemeActive, toggleTheme }}>{children}</ThemeContext>;
}
