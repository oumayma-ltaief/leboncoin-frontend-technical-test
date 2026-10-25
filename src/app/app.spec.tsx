import { AppProviders } from './app-providers';
import { render, screen } from '@testing-library/react';
import { Users } from './core/users/services/users/users';

import { App } from './app';

describe('App', () => {
  it('should create', () => {
    vi.spyOn(Users, 'getUsers').mockReturnValue(new Promise(() => undefined));
    render(
      <AppProviders savedActiveUserId={undefined} savedTheme={undefined}>
        <App>Conversations</App>
      </AppProviders>
    );
    expect(screen.getByRole('banner')).not.toBeNull();
    expect(screen.getByRole('main').textContent).toBe('Conversations');
    vi.restoreAllMocks();
  });
});
