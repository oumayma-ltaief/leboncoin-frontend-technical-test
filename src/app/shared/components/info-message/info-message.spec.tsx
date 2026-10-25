import { render, screen } from '@testing-library/react';

import { InfoMessage } from './info-message';

describe('InfoMessage', () => {
  it('should create', () => {
    render(<InfoMessage title="No conversations yet" />);
    expect(screen.getByRole('status').textContent).toBe('No conversations yet');
  });
});
