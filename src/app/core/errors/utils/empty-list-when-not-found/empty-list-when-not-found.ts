import { toAppError } from '../to-app-error/to-app-error';

export async function emptyListWhenNotFound<Item>(listRequest: Promise<Item[]>): Promise<Item[]> {
  try {
    return await listRequest;
  } catch (error) {
    const appError = toAppError(error);
    if (appError.kind === 'not-found') {
      return [];
    }
    throw appError;
  }
}
