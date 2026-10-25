import { AppError } from '../../../core/errors/models/app-error/app-error';
import { fireEvent, render, screen } from '@testing-library/react';

import { ErrorMessage } from './error-message';

describe('ErrorMessage', () => {
  it('should ask for a retry when try again button is clicked', () => {
    const retry = vi.fn();
    render(<ErrorMessage error={new AppError('network')} title="Couldn't load users" onRetry={retry} />);
    expect(retry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
