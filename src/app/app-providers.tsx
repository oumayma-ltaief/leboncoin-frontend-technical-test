'use client';

import { ActiveUserIdProvider } from './core/users/components/active-user-id-provider/active-user-id-provider';
import { QUERY_CLIENT_CONFIG } from './core/config/query.config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { ThemeProvider } from './core/theme/components/theme-provider/theme-provider';

interface AppProvidersProps {
  children: ReactNode;
  savedActiveUserId: string | undefined;
  savedTheme: string | undefined;
}

export function AppProviders({ children, savedActiveUserId, savedTheme }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient(QUERY_CLIENT_CONFIG));

  return (
    <QueryClientProvider client={queryClient}>
      <ActiveUserIdProvider savedActiveUserId={savedActiveUserId}>
        <ThemeProvider savedTheme={savedTheme}>{children}</ThemeProvider>
      </ActiveUserIdProvider>
    </QueryClientProvider>
  );
}
