import { renderHook } from '@testing-library/react';

import { useActiveUserId } from './active-user-id';

describe('useActiveUserId', () => {
  it('should refuse to give the active user id outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useActiveUserId())).toThrow('ActiveUserIdProvider');
    vi.restoreAllMocks();
  });
});
