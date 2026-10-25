import { createMockedHookState } from '../../../test-providers';
import { fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from '../../core/theme/hooks/use-theme/use-theme';

import { ThemeToggle } from './theme-toggle';

vi.mock('../../core/theme/hooks/use-theme/use-theme');

describe('ThemeToggle', () => {
  let theme: ReturnType<typeof createMockedHookState<ReturnType<typeof useTheme>>>;

  function getToggleLabel(): string | null {
    return screen.getByRole('button').getAttribute('aria-label');
  }

  beforeEach(() => {
    theme = createMockedHookState<ReturnType<typeof useTheme>>({ isDarkThemeActive: false, toggleTheme: vi.fn() });
    vi.mocked(useTheme).mockImplementation(theme.use);
    render(<ThemeToggle />);
  });

  it('should toggle the theme when clicked', () => {
    expect(theme.current().toggleTheme).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button'));
    expect(theme.current().toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('should offer to switch to the other theme', () => {
    expect(getToggleLabel()).toBe('Switch to dark theme');
    theme.set({ isDarkThemeActive: true });
    expect(getToggleLabel()).toBe('Switch to light theme');
  });
});
