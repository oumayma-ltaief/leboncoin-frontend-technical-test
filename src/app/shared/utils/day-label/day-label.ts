const DATE_LOCALE = 'en-US';
const DAY_AND_MONTH_FORMATTER = new Intl.DateTimeFormat(DATE_LOCALE, { day: 'numeric', month: 'long' });
const DAYS_PER_WEEK = 7;
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(DATE_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
const MILLISECONDS_PER_DAY = 86_400_000;
const RECENT_DAY_LABELS = ['Today', 'Yesterday'];
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(DATE_LOCALE, { weekday: 'long' });

function getDateFormatter(date: Date): Intl.DateTimeFormat {
  if (getElapsedDayCount(date) < DAYS_PER_WEEK) {
    return WEEKDAY_FORMATTER;
  }
  return isCurrentYear(date) ? DAY_AND_MONTH_FORMATTER : FULL_DATE_FORMATTER;
}

function getElapsedDayCount(date: Date): number {
  return Math.round((getStartOfDay(new Date()) - getStartOfDay(date)) / MILLISECONDS_PER_DAY);
}

function getStartOfDay(date: Date): number {
  return new Date(date).setHours(0, 0, 0, 0);
}

function isCurrentYear(date: Date): boolean {
  return date.getFullYear() === new Date().getFullYear();
}

export function formatDayLabel(date: Date): string {
  return RECENT_DAY_LABELS[getElapsedDayCount(date)] ?? getDateFormatter(date).format(date);
}
