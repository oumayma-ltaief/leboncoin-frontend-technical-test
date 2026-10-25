'use client';

import type { AppError } from '../../../../core/errors/models/app-error/app-error';
import { CONVERSATIONS_URL } from '../../../../core/config/routes.config';
import type { DailyMessages } from '../../models/daily-messages/daily-messages';
import { dateToTimestamp } from '../../../../shared/utils/date-to-timestamp/date-to-timestamp';
import { emptyListWhenNotFound } from '../../../../core/errors/utils/empty-list-when-not-found/empty-list-when-not-found';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { Fragment } from 'react';
import { groupMessagesByDay } from '../../utils/group-messages-by-day/group-messages-by-day';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { isLoadingQuery } from '../../../../core/query/utils/is-loading-query/is-loading-query';
import Link from 'next/link';
import type { Message } from '../../models/message/message';
import { MessageDateSeparator } from '../../components/message-date-separator/message-date-separator';
import { MessageForm } from '../../components/message-form/message-form';
import { MessageItem } from '../../components/message-item/message-item';
import { Messages } from '../../services/messages/messages';
import type { NewMessage } from '../../models/new-message/new-message';
import { Skeleton } from '../../../../shared/components/skeleton/skeleton';
import { useConversationParticipant } from '../../contexts/conversation-participant/conversation-participant';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface MessageListContentProps {
  dailyMessageList: DailyMessages[];
  isLoadingMessageList: boolean;
  messageListLoadingError: AppError | undefined;
  onRetry: () => void;
}

const MESSAGE_LIST_QUERY_KEY = 'messages';
const NO_MESSAGES: Message[] = [];

function addMessageOnce(messageList: Message[] | undefined, message: Message): Message[] | undefined {
  const isMessageAlreadyListed = !!messageList?.some((listedMessage) => listedMessage.id === message.id);
  return !messageList || isMessageAlreadyListed ? messageList : [...messageList, message];
}

function getMessageListQueryKey(conversationId: number): [string, number] {
  return [MESSAGE_LIST_QUERY_KEY, conversationId];
}

function sortMessagesByOldestFirst(messages: Message[]): Message[] {
  return messages.toSorted((message, nextMessage) => message.timestamp - nextMessage.timestamp);
}

function MessageListContent({ dailyMessageList, isLoadingMessageList, messageListLoadingError, onRetry }: MessageListContentProps) {
  if (isLoadingMessageList) {
    return <Skeleton className="mb-auto p-4" shape="message" itemCount={4} />;
  }
  if (messageListLoadingError) {
    return <ErrorMessage className="flex-1" title="Couldn't load messages" error={messageListLoadingError} onRetry={onRetry} />;
  }
  if (!dailyMessageList.length) {
    return <InfoMessage className="flex-1" title="No messages yet" description="Messages of this conversation will appear here." />;
  }
  return (
    <ul className="mb-auto flex flex-col gap-3 p-4" aria-label="Messages">
      {dailyMessageList.map((dailyMessages, dayIndex) => (
        <Fragment key={dayIndex}>
          <li>
            <MessageDateSeparator date={dailyMessages.date} />
          </li>
          {dailyMessages.messageList.map((message) => (
            <li key={message.id}>
              <MessageItem message={message} />
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
  );
}

export function ConversationDetail({ conversationId }: { conversationId: number }) {
  const activeUser = useConversationParticipant();
  const queryClient = useQueryClient();
  const messagesQuery = useQuery({
    queryKey: getMessageListQueryKey(conversationId),
    queryFn: () => emptyListWhenNotFound(Messages.getMessages(conversationId))
  });
  const messageSending = useMutation({
    mutationFn: (messageBody: string) => Messages.createMessage(buildNewMessage(messageBody)),
    onSuccess: (sentMessage) => {
      queryClient.setQueryData<Message[]>(getMessageListQueryKey(sentMessage.conversationId), (listedMessages) =>
        addMessageOnce(listedMessages, sentMessage)
      );
    }
  });

  const dailyMessageList = groupMessagesByDay(sortMessagesByOldestFirst(messagesQuery.data ?? NO_MESSAGES));
  const isLoadingMessageList = isLoadingQuery(messagesQuery);
  const messageListLoadingError = messagesQuery.error ?? undefined;
  const isSendingMessage = messageSending.isPending;
  const messageSendingFailure = messageSending.isError ? { error: messageSending.error, messageBody: messageSending.variables } : undefined;
  const isMessageSendingDisabled = isSendingMessage || !!messageSendingFailure || isLoadingMessageList || !!messageListLoadingError;

  function reloadMessageList(): void {
    void messagesQuery.refetch();
  }

  function sendMessage(messageBody: string): void {
    messageSending.mutate(messageBody);
  }

  function buildNewMessage(messageBody: string): NewMessage {
    return {
      authorId: activeUser.id,
      body: messageBody,
      conversationId,
      timestamp: dateToTimestamp(new Date())
    };
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-line bg-surface px-2 md:hidden">
        <Link
          href={CONVERSATIONS_URL}
          className="flex items-center gap-1 rounded-full py-2 pr-4 pl-2 text-sm font-medium text-content-secondary hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Conversations
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto">
        <MessageListContent
          dailyMessageList={dailyMessageList}
          isLoadingMessageList={isLoadingMessageList}
          messageListLoadingError={messageListLoadingError}
          onRetry={reloadMessageList}
        />
      </div>

      <footer className="@container shrink-0 border-t border-line bg-surface">
        {isSendingMessage ? <InfoMessage className="px-3 pt-3 motion-safe:animate-pulse" isCompact title="Sending…" /> : null}
        {messageSendingFailure ? (
          <ErrorMessage
            className="px-3 pt-3"
            isCompact
            title="Couldn't send message"
            error={messageSendingFailure.error}
            onRetry={() => {
              sendMessage(messageSendingFailure.messageBody);
            }}
          />
        ) : null}
        <MessageForm isMessageSendingDisabled={isMessageSendingDisabled} onMessageSubmit={sendMessage} />
      </footer>
    </div>
  );
}
