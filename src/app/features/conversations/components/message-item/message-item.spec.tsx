import { buildUserSession } from '../../../../../test-providers';
import { formatTimeLabel } from '../../../../shared/utils/time-label/time-label';
import type { Message } from '../../models/message/message';
import { render } from '@testing-library/react';
import { timestampToDate } from '../../../../shared/utils/timestamp-to-date/timestamp-to-date';
import type { User } from '../../../../core/users/models/user/user';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

import { MessageItem } from './message-item';

vi.mock('../../../../core/users/hooks/use-user-session/use-user-session');

describe('MessageItem', () => {
  let message: Message;
  let messageItemElement: HTMLElement;
  let userList: [User, User];

  function showMessageOfAuthor(authorId: number): void {
    messageItemElement = render(<MessageItem message={{ ...message, authorId }} />).container.firstElementChild as HTMLElement;
  }

  beforeEach(() => {
    userList = [
      { id: 1, nickname: 'Alice', token: 'token-1' },
      { id: 2, nickname: 'Bob', token: 'token-2' }
    ];
    message = { authorId: userList[0].id, body: 'Hello', conversationId: 1, id: 1, timestamp: 1625659200 };
    vi.mocked(useUserSession).mockReturnValue(buildUserSession({ activeUser: userList[0], userList }));
  });

  it('should show the message with its sending time', () => {
    showMessageOfAuthor(message.authorId);
    expect(messageItemElement.textContent).toContain(message.body);
    expect(messageItemElement.textContent).toContain(formatTimeLabel(timestampToDate(message.timestamp)));
  });

  describe('Message author setting', () => {
    describe('When the active user is the author of the message', () => {
      it('should show the message on the right side as sent by you', () => {
        showMessageOfAuthor(userList[0].id);
        expect(messageItemElement.classList).toContain('items-end');
        expect(messageItemElement.textContent).toContain('You');
      });
    });

    describe('When another user is the author of the message', () => {
      it('should show the message on the left side with the nickname of its author', () => {
        showMessageOfAuthor(userList[1].id);
        expect(messageItemElement.classList).toContain('items-start');
        expect(messageItemElement.textContent).toContain(userList[1].nickname);
      });
    });

    describe('When the author of the message is not among user list', () => {
      it('should show the message on the left side as sent by an unknown user', () => {
        const unknownUserId = 99;
        showMessageOfAuthor(unknownUserId);
        expect(messageItemElement.classList).toContain('items-start');
        expect(messageItemElement.textContent).toContain('Unknown user');
      });
    });
  });
});
