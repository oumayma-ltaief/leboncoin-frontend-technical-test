import { formatDayLabel } from './day-label';

describe('formatDayLabel', () => {
  let currentDate: Date;

  beforeEach(() => {
    currentDate = new Date(2026, 5, 15, 12);
    vi.useFakeTimers({ now: currentDate, toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('When the date is today', () => {
    it('should say today', () => {
      const earlierTodayDate = new Date(2026, 5, 15, 8);
      expect(formatDayLabel(earlierTodayDate)).toBe('Today');
    });
  });

  describe('When the date is yesterday', () => {
    it('should say yesterday', () => {
      const yesterdayEveningDate = new Date(2026, 5, 14, 23);
      expect(formatDayLabel(yesterdayEveningDate)).toBe('Yesterday');
    });
  });

  describe('When the date is earlier in the last seven days', () => {
    it('should show the day of the week', () => {
      const threeDaysAgoDate = new Date(2026, 5, 12, 12);
      expect(formatDayLabel(threeDaysAgoDate)).toBe('Friday');
    });
  });

  describe('When the date is earlier this year', () => {
    it('should show the day and the month', () => {
      const twoWeeksAgoDate = new Date(2026, 5, 1, 12);
      expect(formatDayLabel(twoWeeksAgoDate)).toBe('June 1');
    });
  });

  describe('When the date is in another year', () => {
    it('should show the day, the month and the year', () => {
      const fiveYearsAgoDate = new Date(2021, 6, 7, 12);
      expect(formatDayLabel(fiveYearsAgoDate)).toBe('July 7, 2021');
    });
  });
});
