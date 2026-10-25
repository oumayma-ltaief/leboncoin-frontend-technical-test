import { formatTimeLabel } from './time-label';

describe('formatTimeLabel', () => {
  it('should show hours and minutes on a 24-hour clock', () => {
    const lateEveningDate = new Date(2026, 5, 15, 21, 5);
    expect(formatTimeLabel(lateEveningDate)).toBe('21:05');
  });
});
