'use client';

import './conversation-recipient-dialog.css';
import { type ChangeEvent, type ReactNode, type Ref, useImperativeHandle, useRef, useState } from 'react';
import { getInitial } from '../../../../shared/utils/initial/initial';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import type { User } from '../../../../core/users/models/user/user';

export interface ConversationRecipientDialogHandle {
  closeDialog: () => void;
  openDialog: () => void;
}

interface ConversationRecipientDialogProps {
  children?: ReactNode;
  isRecipientChoiceDisabled?: boolean;
  onRecipientChoose: (recipient: User) => void;
  recipientList: User[];
  ref: Ref<ConversationRecipientDialogHandle>;
}

function hasRecipientMatchingSearchTerm(recipient: User, recipientSearchTerm: string): boolean {
  return recipient.nickname.toLowerCase().includes(recipientSearchTerm.trim().toLowerCase());
}

export function ConversationRecipientDialog({
  children,
  isRecipientChoiceDisabled = false,
  onRecipientChoose,
  recipientList,
  ref
}: ConversationRecipientDialogProps) {
  const conversationRecipientDialog = useRef<HTMLDialogElement>(null);
  const recipientSearchBox = useRef<HTMLInputElement>(null);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');

  const recipientListMatchingSearchTerm = recipientList.filter((recipient) => hasRecipientMatchingSearchTerm(recipient, recipientSearchTerm));

  function clearRecipientSearchTerm(): void {
    setRecipientSearchTerm('');
    recipientSearchBox.current?.focus();
  }

  function closeDialog(): void {
    conversationRecipientDialog.current?.close();
  }

  function filterRecipientList(searchEvent: ChangeEvent<HTMLInputElement>): void {
    setRecipientSearchTerm(searchEvent.target.value);
  }

  function openDialog(): void {
    setRecipientSearchTerm('');
    conversationRecipientDialog.current?.showModal();
  }

  useImperativeHandle(ref, () => ({
    closeDialog,
    openDialog
  }));

  return (
    <dialog
      ref={conversationRecipientDialog}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-line bg-surface p-0 text-content shadow-xl backdrop:bg-backdrop"
      aria-labelledby="conversation-recipient-dialog-title"
    >
      <header className="flex items-center justify-between border-b border-line py-2 pr-2 pl-4">
        <h2 id="conversation-recipient-dialog-title" className="text-base font-bold">
          New conversation
        </h2>
        <button
          type="button"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-brand"
          aria-label="Close"
          onClick={closeDialog}
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      {children}

      {recipientList.length ? (
        <>
          <div className="relative mx-4 mt-4">
            <input
              ref={recipientSearchBox}
              type="search"
              className="w-full rounded-lg border border-line bg-surface py-2 pr-10 pl-3 text-sm text-content placeholder:text-content-muted focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
              placeholder="Search a user"
              aria-label="Search a user"
              value={recipientSearchTerm}
              onChange={filterRecipientList}
            />
            {recipientSearchTerm ? (
              <button
                type="button"
                className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-content-muted transition-colors hover:bg-surface-subtle hover:text-content focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="Clear search"
                onClick={clearRecipientSearchTerm}
              >
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            ) : null}
          </div>

          {recipientListMatchingSearchTerm.length ? (
            <ul className="flex max-h-72 flex-col overflow-y-auto p-2">
              {recipientListMatchingSearchTerm.map((recipient) => (
                <li key={recipient.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
                    disabled={isRecipientChoiceDisabled}
                    onClick={() => {
                      onRecipientChoose(recipient);
                    }}
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand-strong"
                      aria-hidden="true"
                    >
                      {getInitial(recipient.nickname)}
                    </span>
                    <span className="truncate text-[15px] font-semibold">{recipient.nickname}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <InfoMessage title="No user found" description="Try another nickname." />
          )}
        </>
      ) : (
        <InfoMessage title="No one to message" description="There is no other user yet." />
      )}
    </dialog>
  );
}
