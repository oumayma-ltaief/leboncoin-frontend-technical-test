'use client';

import type { Conversation } from '../../models/conversation/conversation';
import { formatDayLabel } from '../../../../shared/utils/day-label/day-label';
import { getConversationUrl } from '../../utils/conversation-url/conversation-url';
import { getInitial } from '../../../../shared/utils/initial/initial';
import Link from 'next/link';
import { timestampToDate } from '../../../../shared/utils/timestamp-to-date/timestamp-to-date';
import { usePathname } from 'next/navigation';

interface ConversationItemProps {
  activeUserId: number;
  conversation: Conversation;
}

const ACTIVE_USER_STARTER_LABEL = 'You';
const CONVERSATION_LINK_CLASS =
  'group relative flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand';
const CONVERSATION_STARTED_LABEL = 'started this conversation';
const OPEN_CONVERSATION_LINK_CLASS = `${CONVERSATION_LINK_CLASS} bg-brand-soft hover:bg-brand-soft`;

export function ConversationItem({ activeUserId, conversation }: ConversationItemProps) {
  const isActiveUserSender = conversation.senderId === activeUserId;
  const contactNickname = isActiveUserSender ? conversation.recipientNickname : conversation.senderNickname;
  const contactInitial = getInitial(contactNickname);
  const conversationStarterName = isActiveUserSender ? ACTIVE_USER_STARTER_LABEL : conversation.senderNickname;
  const conversationStarterLabel = `${conversationStarterName} ${CONVERSATION_STARTED_LABEL}`;
  const conversationUrl = getConversationUrl(conversation.id);
  const isConversationOpen = usePathname() === conversationUrl;
  const conversationLinkClass = isConversationOpen ? OPEN_CONVERSATION_LINK_CLASS : CONVERSATION_LINK_CLASS;
  const currentPageMarker = isConversationOpen ? 'page' : undefined;
  const lastMessageDayLabel = formatDayLabel(timestampToDate(conversation.lastMessageTimestamp));

  return (
    <Link className={conversationLinkClass} href={conversationUrl} aria-current={currentPageMarker}>
      <span
        className="absolute inset-y-2 left-0 w-1 scale-y-0 rounded-r-full bg-brand group-aria-[current=page]:scale-y-100 motion-safe:transition-transform motion-safe:duration-200"
        aria-hidden="true"
      />
      <span
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-tint text-base font-bold text-brand-strong group-active:scale-95 group-aria-[current=page]:bg-brand group-aria-[current=page]:text-on-brand motion-safe:transition motion-safe:duration-200"
        aria-hidden="true"
      >
        {contactInitial}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-content">{contactNickname}</span>
          <span className="shrink-0 text-xs text-content-muted">{lastMessageDayLabel}</span>
        </span>
        <span className="truncate text-sm text-content-muted">{conversationStarterLabel}</span>
      </span>
    </Link>
  );
}
