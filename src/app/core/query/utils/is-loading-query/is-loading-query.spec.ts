import { isLoadingQuery } from './is-loading-query';

describe('isLoadingQuery', () => {
  describe('When the query has not answered yet', () => {
    it('should be loading', () => {
      expect(isLoadingQuery({ isError: false, isFetching: true, isPending: true })).toBe(true);
    });

    it('should not be loading when the query is disabled', () => {
      const isQueryEnabled = false;
      expect(isLoadingQuery({ isError: false, isFetching: false, isPending: true }, isQueryEnabled)).toBe(false);
    });
  });

  describe('When the query has data', () => {
    it('should not be loading while the data is refreshed, so what is on screen stays', () => {
      expect(isLoadingQuery({ isError: false, isFetching: true, isPending: false })).toBe(false);
    });
  });

  describe('When the query failed', () => {
    it('should not be loading while the error is shown', () => {
      expect(isLoadingQuery({ isError: true, isFetching: false, isPending: false })).toBe(false);
    });

    it('should be loading again when it is retried', () => {
      expect(isLoadingQuery({ isError: true, isFetching: true, isPending: false })).toBe(true);
    });
  });
});
