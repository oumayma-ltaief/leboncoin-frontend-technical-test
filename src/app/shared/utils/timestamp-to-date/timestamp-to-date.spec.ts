import { timestampToDate } from './timestamp-to-date';

describe('timestampToDate', () => {
  it('should convert a timestamp in seconds to its date', () => {
    const timestampInSeconds = 1625659200;
    expect(timestampToDate(timestampInSeconds).toISOString()).toBe('2021-07-07T12:00:00.000Z');
  });
});
