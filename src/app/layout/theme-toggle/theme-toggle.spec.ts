import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { signal, WritableSignal } from '@angular/core';
import { Theme } from '../../core/theme/services/theme/theme';

import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  let fixture: ComponentFixture<ThemeToggle>;
  let theme: { isDarkThemeActive: WritableSignal<boolean>; toggleTheme: Mock };
  let toggleButton: HTMLButtonElement;

  function getToggleLabel(): string | null {
    fixture.detectChanges();
    return toggleButton.getAttribute('aria-label');
  }

  beforeEach(() => {
    theme = { isDarkThemeActive: signal(false), toggleTheme: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: Theme, useValue: theme }]
    });
    fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();
    toggleButton = (fixture.nativeElement as HTMLElement).querySelector('button')!;
  });

  it('should toggle the theme when clicked', () => {
    expect(theme.toggleTheme).not.toHaveBeenCalled();
    toggleButton.click();
    expect(theme.toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should offer to switch to the other theme', () => {
    expect(getToggleLabel()).toBe('Switch to dark theme');
    theme.isDarkThemeActive.set(true);
    expect(getToggleLabel()).toBe('Switch to light theme');
  });
});
