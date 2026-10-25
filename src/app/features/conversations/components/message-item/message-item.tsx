'use client';

import { formatTimeLabel } from '../../../../shared/utils/time-label/time-label';
import { getInitial } from '../../../../shared/utils/initial/initial';
import type { Message } from '../../models/message/message';
import { timestampToDate } from '../../../../shared/utils/timestamp-to-date/timestamp-to-date';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

const ACTIVE_USER_AUTHOR_LABEL = 'You';
const ACTIVE_USER_MESSAGE_CLASSES = { bubble: 'rounded-br-md bg-brand-tint', details: '', side: 'items-end' };
const OTHER_AUTHOR_MESSAGE_CLASSES = { bubble: 'rounded-bl-md bg-surface shadow-sm', details: 'pl-11', side: 'items-start' };
const UNKNOWN_AUTHOR_LABEL = 'Unknown user';

export function MessageItem({ message }: { message: Message }) {
  const { activeUser, userList } = useUserSession();

  const isSentByActiveUser = message.authorId === activeUser?.id;
  const otherAuthorNickname = userList.find((user) => user.id === message.authorId)?.nickname ?? UNKNOWN_AUTHOR_LABEL;
  const authorNickname = isSentByActiveUser ? ACTIVE_USER_AUTHOR_LABEL : otherAuthorNickname;
  const authorInitial = getInitial(authorNickname);
  const messageClasses = isSentByActiveUser ? ACTIVE_USER_MESSAGE_CLASSES : OTHER_AUTHOR_MESSAGE_CLASSES;
  const sendingTimeLabel = formatTimeLabel(timestampToDate(message.timestamp));

  return (
    <div className={`flex flex-col ${messageClasses.side}`}>
      <div className="flex max-w-[85%] items-end gap-2 md:max-w-[65%]">
        {isSentByActiveUser ? null : (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand-strong"
            aria-hidden="true"
          >
            {authorInitial}
          </span>
        )}
        <p className={`min-w-0 rounded-2xl px-4 py-2 text-[15px] leading-snug break-words whitespace-pre-line text-content ${messageClasses.bubble}`}>
          {message.body}
        </p>
      </div>
      <span className={`mt-1 px-1 text-xs text-content-muted ${messageClasses.details}`}>
        <span className="font-semibold text-content-secondary">{authorNickname}</span> · {sendingTimeLabel}
      </span>
    </div>
  );
}
