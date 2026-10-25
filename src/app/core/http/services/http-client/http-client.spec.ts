import { AppError } from '../../../errors/models/app-error/app-error';
import { HttpError } from '../../../errors/models/http-error/http-error';
import type { MockInstance } from 'vitest';

import { getJson, postJson, REQUEST_TIMEOUT_MILLISECONDS } from './http-client';

describe('HttpClient', () => {
  const RESOURCE_URL = '/resource';
  let fetchSpy: MockInstance<typeof fetch>;
  let fetchResponse: PromiseWithResolvers<Response>;

  function getSentRequest(): RequestInit | undefined {
    return fetchSpy.mock.calls[0]?.[1];
  }

  function makeRequestTimeoutFollowFakeTimers(): void {
    vi.useFakeTimers();
    vi.spyOn(AbortSignal, 'timeout').mockImplementation((milliseconds) => {
      const requestTimeout = new AbortController();
      setTimeout(() => {
        requestTimeout.abort(new DOMException('The operation timed out.', 'TimeoutError'));
      }, milliseconds);
      return requestTimeout.signal;
    });
  }

  beforeEach(() => {
    fetchResponse = Promise.withResolvers<Response>();
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchResponse.promise);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Get JSON', () => {
    it('should give the body of a successful response', async () => {
      const resourceRequest = getJson(RESOURCE_URL);
      expect(fetchSpy).toHaveBeenCalledWith(RESOURCE_URL, expect.objectContaining({ method: 'GET' }));
      fetchResponse.resolve(Response.json({ id: 1 }));
      await expect(resourceRequest).resolves.toEqual({ id: 1 });
    });

    it('should fail with an app error keeping the http error as cause when the response is a failure', async () => {
      const resourceRequest = getJson(RESOURCE_URL);
      fetchResponse.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
      const thrownError: unknown = await resourceRequest.catch((error: unknown) => error);
      expect(thrownError).toBeInstanceOf(AppError);
      expect((thrownError as AppError).cause).toBeInstanceOf(HttpError);
    });

    it('should fail with an app error keeping the timeout error as cause when the request is left unanswered for too long', async () => {
      const millisecondsBeforeTimeout = REQUEST_TIMEOUT_MILLISECONDS - 1;
      makeRequestTimeoutFollowFakeTimers();
      fetchSpy.mockImplementation(
        (_url, requestInit) =>
          new Promise((_resolve, reject) => {
            requestInit?.signal?.addEventListener('abort', () => {
              reject(requestInit.signal?.reason as Error);
            });
          })
      );
      let thrownError: unknown;
      getJson(RESOURCE_URL).catch((error: unknown) => (thrownError = error));
      await vi.advanceTimersByTimeAsync(millisecondsBeforeTimeout);
      expect(thrownError).toBeUndefined();
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MILLISECONDS - millisecondsBeforeTimeout);
      expect(thrownError).toBeInstanceOf(AppError);
      expect((thrownError as AppError).kind).toBe('unavailable');
    });
  });

  describe('Post JSON', () => {
    it('should send the body as JSON and give the body of the response', async () => {
      const createdResource = { id: 2 };
      const resourceCreation = postJson(RESOURCE_URL, { name: 'New resource' });
      expect(getSentRequest()).toEqual(expect.objectContaining({ body: '{"name":"New resource"}', method: 'POST' }));
      fetchResponse.resolve(Response.json(createdResource, { status: 201 }));
      await expect(resourceCreation).resolves.toEqual(createdResource);
    });
  });
});
