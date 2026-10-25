const SECONDS_PER_YEAR = 31_536_000;

export function storeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${String(SECONDS_PER_YEAR)}; samesite=lax`;
}
