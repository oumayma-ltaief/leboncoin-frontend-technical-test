import { render, screen } from '@testing-library/react';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  function getItems(): HTMLElement[] {
    return Array.from(screen.getByRole('status').querySelectorAll('div'));
  }

  it('should show as many items as requested', () => {
    const { rerender } = render(<Skeleton />);
    expect(getItems()).toHaveLength(1);
    rerender(<Skeleton itemCount={3} />);
    expect(getItems()).toHaveLength(3);
  });

  it('should style its items according to the given shape and tone', () => {
    const { rerender } = render(<Skeleton />);
    expect(getItems()[0]?.classList).toContain('h-12');
    expect(getItems()[0]?.classList).toContain('bg-surface-subtle');
    rerender(<Skeleton shape="field" tone="brand" />);
    expect(getItems()[0]?.classList).toContain('w-28');
    expect(getItems()[0]?.classList).toContain('bg-brand-tint');
  });
});
