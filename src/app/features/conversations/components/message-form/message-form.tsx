'use client';

import { type ChangeEvent, type KeyboardEvent, type ModifierKey, type SyntheticEvent, useState } from 'react';

interface MessageFormProps {
  isMessageSendingDisabled?: boolean;
  onMessageSubmit: (messageBody: string) => void;
}

const ENTER_KEY = 'Enter';
const MODIFIER_KEYS: ModifierKey[] = ['Alt', 'Control', 'Meta', 'Shift'];

export const MAX_MESSAGE_LENGTH = 1000;

function isEnterPressedAlone(keyboardEvent: KeyboardEvent): boolean {
  return keyboardEvent.key === ENTER_KEY && !MODIFIER_KEYS.some((modifierKey) => keyboardEvent.getModifierState(modifierKey));
}

export function MessageForm({ isMessageSendingDisabled = false, onMessageSubmit }: MessageFormProps) {
  const [messageBody, setMessageBody] = useState('');

  const trimmedMessageBody = messageBody.trim();
  const isMessageBodyFilled = !!trimmedMessageBody;
  const isMessageBodyWithinMaxLength = trimmedMessageBody.length <= MAX_MESSAGE_LENGTH;
  const isMessageReadyToSend = !isMessageSendingDisabled && isMessageBodyFilled && isMessageBodyWithinMaxLength;

  function submitMessage(submitEvent: SyntheticEvent): void {
    submitEvent.preventDefault();
    if (isMessageReadyToSend) {
      onMessageSubmit(trimmedMessageBody);
      setMessageBody('');
    }
  }

  function submitMessageOnEnter(keyboardEvent: KeyboardEvent): void {
    if (isEnterPressedAlone(keyboardEvent)) {
      submitMessage(keyboardEvent);
    }
  }

  function updateMessageBody(inputEvent: ChangeEvent<HTMLTextAreaElement>): void {
    setMessageBody(inputEvent.target.value);
  }

  return (
    <form className="p-3" onSubmit={submitMessage}>
      <div className="flex items-end gap-2">
        <textarea
          rows={1}
          className="field-sizing-content max-h-32 min-h-10 md:min-h-20 min-w-0 flex-1 resize-none rounded-2xl border border-line bg-surface-muted px-4 py-2 text-[15px] leading-snug text-content placeholder:text-content-muted focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
          placeholder="Write a message"
          aria-label="Message"
          aria-describedby="message-sending-hint"
          maxLength={MAX_MESSAGE_LENGTH}
          value={messageBody}
          onChange={updateMessageBody}
          onKeyDown={submitMessageOnEnter}
        />
        <button
          type="submit"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand transition duration-150 hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 motion-safe:active:scale-95"
          aria-label="Send message"
          title="Send message"
          disabled={!isMessageReadyToSend}
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
            <path d="M6 12L3.27 3.13a59.77 59.77 0 0 1 18.21 8.87 59.77 59.77 0 0 1-18.21 8.88L6 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <p id="message-sending-hint" className="px-4 pt-1.5 text-xs text-content-muted pointer-coarse:hidden">
        Press <kbd className="font-sans font-semibold text-content-secondary">Enter</kbd> to send,{' '}
        <kbd className="font-sans font-semibold text-content-secondary">Shift + Enter</kbd> for a new line.
      </p>
    </form>
  );
}
