import { renderHook } from '@testing-library/react';

import { useConversationParticipant } from './conversation-participant';

describe('useConversationParticipant', () => {
  it('should refuse to give the participant of a conversation outside its guard', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useConversationParticipant())).toThrow('ActiveUserConversationGuard');
    vi.restoreAllMocks();
  });
});
