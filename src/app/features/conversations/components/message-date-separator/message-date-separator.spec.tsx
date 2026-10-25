import { render, screen } from '@testing-library/react';

import { MessageDateSeparator } from './message-date-separator';

describe('MessageDateSeparator', () => {
  it('should create', () => {
    render(<MessageDateSeparator date={new Date()} />);
    expect(screen.getByText('Today')).not.toBeNull();
  });
});
