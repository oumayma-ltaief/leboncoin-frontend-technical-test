import { HttpError } from '../../../errors/models/http-error/http-error';
import { toAppError } from '../../../errors/utils/to-app-error/to-app-error';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const REQUEST_TIMEOUT_MILLISECONDS = 10_000;

async function requestJson<ResponseBody>(url: string, requestInit: RequestInit): Promise<ResponseBody> {
  try {
    const response = await fetch(url, { ...requestInit, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS) });
    if (!response.ok) {
      throw new HttpError(response.status);
    }
    return (await response.json()) as ResponseBody;
  } catch (error) {
    throw toAppError(error);
  }
}

export function getJson<ResponseBody>(url: string): Promise<ResponseBody> {
  return requestJson<ResponseBody>(url, { method: 'GET' });
}

export function postJson<ResponseBody>(url: string, body: unknown): Promise<ResponseBody> {
  return requestJson<ResponseBody>(url, { body: JSON.stringify(body), headers: JSON_HEADERS, method: 'POST' });
}
