import { renderWithProviders } from '../../../test-providers';
import { screen } from '@testing-library/react';
import { Users } from '../../core/users/services/users/users';

import { Header } from './header';

describe('Header', () => {
  it('should create', () => {
    vi.spyOn(Users, 'getUsers').mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<Header />);
    expect(screen.getByRole('link', { name: 'leboncoin' })).not.toBeNull();
    vi.restoreAllMocks();
  });
});
