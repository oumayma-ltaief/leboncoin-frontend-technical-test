import { dateToTimestamp } from './date-to-timestamp';

describe('dateToTimestamp', () => {
  it('should convert a date to its timestamp in seconds', () => {
    const date = new Date('2021-07-07T12:00:00.500Z');
    expect(dateToTimestamp(date)).toBe(1625659200);
  });
});
