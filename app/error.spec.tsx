import { fireEvent, render, screen } from '@testing-library/react';

import ErrorPage from './error';

describe('ErrorPage', () => {
  it('should tell that something went wrong and render the page again when trying again', () => {
    const retry = vi.fn();
    render(<ErrorPage error={new Error('Rendering failed')} retry={retry} />);
    expect(screen.getByRole('alert').textContent).toContain('Something went wrong');
    expect(retry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
