import { getConversationUrl } from './conversation-url';

describe('getConversationUrl', () => {
  it('should give the address of the conversation', () => {
    const conversationId = 7;
    expect(getConversationUrl(conversationId)).toBe('/conversations/7');
  });
});
