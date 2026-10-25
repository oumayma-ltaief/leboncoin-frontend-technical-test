export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`Request failed with status ${String(status)}`);
  }
}
