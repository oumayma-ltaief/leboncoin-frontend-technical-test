import { DOCUMENT } from '@angular/common';
import { inject, Service, signal } from '@angular/core';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const DARK_THEME_CLASS = 'dark';
const DARK_THEME_STORAGE_KEY = 'leboncoin-dark-theme';

@Service()
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly isDarkThemeActiveState = signal(this.isDarkThemeActiveAtStart());

  readonly isDarkThemeActive = this.isDarkThemeActiveState.asReadonly();

  constructor() {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkThemeActiveState.update((isActive) => !isActive);
    this.applyThemeWithTransition();
    this.saveTheme();
  }

  private applyTheme(): void {
    this.document.documentElement.classList.toggle(DARK_THEME_CLASS, this.isDarkThemeActive());
  }

  private applyThemeWithTransition(): void {
    if (this.isViewTransitionSupported()) {
      this.document.startViewTransition(() => this.applyTheme());
    } else {
      this.applyTheme();
    }
  }

  private hasSavedTheme(): boolean {
    return localStorage.getItem(DARK_THEME_STORAGE_KEY) !== null;
  }

  private isDarkThemeActiveAtStart(): boolean {
    return this.hasSavedTheme() ? this.isDarkThemeSaved() : this.isDarkThemePreferredBySystem();
  }

  private isDarkThemePreferredBySystem(): boolean {
    return window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches;
  }

  private isDarkThemeSaved(): boolean {
    return localStorage.getItem(DARK_THEME_STORAGE_KEY) === String(true);
  }

  private isViewTransitionSupported(): boolean {
    return 'startViewTransition' in this.document;
  }

  private saveTheme(): void {
    localStorage.setItem(DARK_THEME_STORAGE_KEY, String(this.isDarkThemeActive()));
  }
}
