import { renderHook } from '@testing-library/react';

import { useTheme } from './use-theme';

describe('useTheme', () => {
  it('should refuse to give the theme outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useTheme())).toThrow('ThemeProvider');
    vi.restoreAllMocks();
  });
});
