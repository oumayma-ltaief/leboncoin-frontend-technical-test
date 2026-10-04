import { MILLISECONDS_PER_SECOND } from '../timestamp-to-date/timestamp-to-date';

export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / MILLISECONDS_PER_SECOND);
}
