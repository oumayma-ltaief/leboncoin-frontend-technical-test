import { ThemeContext, type ThemeState } from '../../contexts/theme/theme';
import { use } from 'react';

const MISSING_PROVIDER_MESSAGE = 'The theme is only available inside ThemeProvider';

export function useTheme(): ThemeState {
  const themeState = use(ThemeContext);
  if (!themeState) {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  }
  return themeState;
}
