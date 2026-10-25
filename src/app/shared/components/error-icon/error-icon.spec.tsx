import { APP_ERROR_MESSAGES, type AppErrorKind } from '../../../core/errors/models/app-error/app-error';
import { render } from '@testing-library/react';

import { ErrorIcon } from './error-icon';

describe('ErrorIcon', () => {
  function getIconDrawing(errorKind: AppErrorKind): string {
    return render(<ErrorIcon errorKind={errorKind} />).container.querySelector('svg')?.innerHTML ?? '';
  }

  it('should draw a different icon for each kind of error', () => {
    const errorKinds = Object.keys(APP_ERROR_MESSAGES) as AppErrorKind[];
    const iconDrawings = new Set(errorKinds.map(getIconDrawing));
    expect(iconDrawings.size).toBe(errorKinds.length);
  });
});
