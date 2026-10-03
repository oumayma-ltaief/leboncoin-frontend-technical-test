const MILLISECONDS_PER_SECOND = 1000;

export function timestampToDate(timestampInSeconds: number): Date {
  return new Date(timestampInSeconds * MILLISECONDS_PER_SECOND);
}
