'use client';

import type { Conversation } from '../../models/conversation/conversation';
import { ConversationRecipientDialog, type ConversationRecipientDialogHandle } from '../conversation-recipient-dialog/conversation-recipient-dialog';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { getConversationUrl } from '../../utils/conversation-url/conversation-url';
import { useActiveUserConversations } from '../../hooks/use-active-user-conversations/use-active-user-conversations';
import { useMutation } from '@tanstack/react-query';
import type { User } from '../../../../core/users/models/user/user';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '../../../../core/users/hooks/use-user-session/use-user-session';

export function NewConversation({ activeUser }: { activeUser: User }) {
  const { createConversation, findConversationWith } = useActiveUserConversations();
  const router = useRouter();
  const { userList } = useUserSession();
  const conversationRecipientDialog = useRef<ConversationRecipientDialogHandle>(null);
  const conversationCreation = useMutation({ mutationFn: (recipient: User) => createConversation(activeUser, recipient) });

  const recipientList = userList.filter((user) => user.id !== activeUser.id);
  const isCreatingConversation = conversationCreation.isPending;
  const conversationCreationFailure = conversationCreation.isError
    ? { error: conversationCreation.error, recipient: conversationCreation.variables }
    : undefined;

  function openConversationRecipientDialog(): void {
    conversationCreation.reset();
    conversationRecipientDialog.current?.openDialog();
  }

  function startConversationWith(recipient: User): void {
    const existingConversation = findConversationWith(recipient);
    if (existingConversation) {
      openConversation(existingConversation);
    } else {
      createConversationWith(recipient);
    }
  }

  function createConversationWith(recipient: User): void {
    conversationCreation.mutate(recipient, { onSuccess: openConversation });
  }

  function openConversation(conversation: Conversation): void {
    conversationRecipientDialog.current?.closeDialog();
    router.push(getConversationUrl(conversation.id));
  }

  return (
    <>
      <button
        type="button"
        className="flex size-10 cursor-pointer items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-brand"
        aria-label="New conversation"
        title="New conversation"
        onClick={openConversationRecipientDialog}
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z" />
          <path d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      </button>

      <ConversationRecipientDialog
        ref={conversationRecipientDialog}
        isRecipientChoiceDisabled={isCreatingConversation}
        recipientList={recipientList}
        onRecipientChoose={startConversationWith}
      >
        {conversationCreationFailure ? (
          <ErrorMessage
            title="Couldn't create conversation"
            error={conversationCreationFailure.error}
            onRetry={() => {
              startConversationWith(conversationCreationFailure.recipient);
            }}
          />
        ) : null}
      </ConversationRecipientDialog>
    </>
  );
}
