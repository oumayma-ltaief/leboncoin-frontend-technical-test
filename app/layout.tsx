import '../src/styles.css';
import { ACTIVE_USER_ID_COOKIE_NAME, DARK_THEME_COOKIE_NAME } from '../src/app/core/config/cookies.config';
import { App } from '../src/app/app';
import { AppProviders } from '../src/app/app-providers';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const DARK_THEME_CLASS = 'dark';

export const metadata: Metadata = {
  description: 'leboncoin messaging: share messages about a transaction, or ask for information about any product.',
  icons: { icon: '/favicon.ico' },
  title: 'leboncoin'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const savedActiveUserId = cookieStore.get(ACTIVE_USER_ID_COOKIE_NAME)?.value;
  const savedTheme = cookieStore.get(DARK_THEME_COOKIE_NAME)?.value;
  const themeClass = savedTheme === String(true) ? DARK_THEME_CLASS : undefined;

  return (
    <html lang="en" className={themeClass} suppressHydrationWarning>
      <body>
        <AppProviders savedActiveUserId={savedActiveUserId} savedTheme={savedTheme}>
          <App>{children}</App>
        </AppProviders>
      </body>
    </html>
  );
}
