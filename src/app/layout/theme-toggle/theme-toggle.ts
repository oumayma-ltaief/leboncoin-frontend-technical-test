import { Component, computed, inject } from '@angular/core';
import { Theme } from '../../core/theme/services/theme/theme';

@Component({
  selector: 'app-theme-toggle',
  styleUrl: './theme-toggle.css',
  templateUrl: './theme-toggle.html'
})
export class ThemeToggle {
  private readonly theme = inject(Theme);

  protected readonly isDarkThemeActive = this.theme.isDarkThemeActive;
  protected readonly toggleLabel = computed(() => `Switch to ${this.isDarkThemeActive() ? 'light' : 'dark'} theme`);

  toggleTheme(): void {
    this.theme.toggleTheme();
  }
}
