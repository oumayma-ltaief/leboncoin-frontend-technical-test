const TIME_LOCALE = 'en-US';
const TIME_FORMATTER = new Intl.DateTimeFormat(TIME_LOCALE, { hour: '2-digit', hourCycle: 'h23', minute: '2-digit' });

export function formatTimeLabel(date: Date): string {
  return TIME_FORMATTER.format(date);
}
