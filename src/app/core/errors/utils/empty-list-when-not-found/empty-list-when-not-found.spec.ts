import { AppError } from '../../models/app-error/app-error';

import { emptyListWhenNotFound } from './empty-list-when-not-found';

describe('emptyListWhenNotFound', () => {
  describe('When the list is found', () => {
    it('should give the list', async () => {
      const itemList = ['first item', 'second item'];
      await expect(emptyListWhenNotFound(Promise.resolve(itemList))).resolves.toEqual(itemList);
    });
  });

  describe('When the list is not found', () => {
    it('should give an empty list', async () => {
      await expect(emptyListWhenNotFound(Promise.reject(new AppError('not-found')))).resolves.toEqual([]);
    });
  });

  describe('When the list request fails for another reason', () => {
    it('should fail with the app error of that reason', async () => {
      const serverError = new AppError('server');
      await expect(emptyListWhenNotFound(Promise.reject(serverError))).rejects.toBe(serverError);
    });
  });
});
