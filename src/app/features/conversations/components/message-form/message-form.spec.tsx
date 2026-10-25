import { fireEvent, render, screen } from '@testing-library/react';

import { MAX_MESSAGE_LENGTH, MessageForm } from './message-form';

describe('MessageForm', () => {
  let messageBox: HTMLTextAreaElement;
  let messageFormView: ReturnType<typeof render>;
  let sendButton: HTMLButtonElement;
  let submitMessage: (messageBody: string) => void;

  function pressEnter(modifiers: { shiftKey?: boolean } = {}): void {
    fireEvent.keyDown(messageBox, { key: 'Enter', ...modifiers });
  }

  function writeMessage(messageBody: string): void {
    fireEvent.change(messageBox, { target: { value: messageBody } });
  }

  beforeEach(() => {
    submitMessage = vi.fn();
    messageFormView = render(<MessageForm onMessageSubmit={submitMessage} />);
    messageBox = screen.getByRole('textbox', { name: 'Message' });
    sendButton = screen.getByRole('button', { name: 'Send message' });
  });

  describe('Submit message', () => {
    describe('When a message is written', () => {
      it('should submit it without surrounding spaces and empty the message box', () => {
        writeMessage('  Hello Bob  ');
        expect(submitMessage).not.toHaveBeenCalled();
        fireEvent.click(sendButton);
        expect(submitMessage).toHaveBeenCalledWith('Hello Bob');
        expect(messageBox.value).toBe('');
      });

      it('should submit it when Enter is pressed', () => {
        writeMessage('Hello Bob');
        expect(submitMessage).not.toHaveBeenCalled();
        pressEnter();
        expect(submitMessage).toHaveBeenCalledWith('Hello Bob');
      });

      it('should not submit it when Shift + Enter is pressed, to let a new line be written', () => {
        writeMessage('Hello Bob');
        pressEnter({ shiftKey: true });
        expect(submitMessage).not.toHaveBeenCalled();
        expect(messageBox.value).toBe('Hello Bob');
      });
    });

    describe('When message is empty', () => {
      it('should not submit it', () => {
        writeMessage('   ');
        expect(sendButton.disabled).toBe(true);
        pressEnter();
        expect(submitMessage).not.toHaveBeenCalled();
      });
    });

    describe('When message is longer than the maximum length', () => {
      it('should not submit it', () => {
        writeMessage('a'.repeat(MAX_MESSAGE_LENGTH));
        expect(sendButton.disabled).toBe(false);
        writeMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1));
        expect(sendButton.disabled).toBe(true);
        pressEnter();
        expect(submitMessage).not.toHaveBeenCalled();
      });
    });

    describe('When message sending is disabled', () => {
      it('should not submit the written message and keep it in the message box', () => {
        writeMessage('Hello Bob');
        expect(sendButton.disabled).toBe(false);
        messageFormView.rerender(<MessageForm isMessageSendingDisabled onMessageSubmit={submitMessage} />);
        expect(sendButton.disabled).toBe(true);
        pressEnter();
        expect(submitMessage).not.toHaveBeenCalled();
        expect(messageBox.value).toBe('Hello Bob');
      });
    });
  });

  describe('Update message body', () => {
    it('should make the message ready to send when a message is written', () => {
      expect(sendButton.disabled).toBe(true);
      writeMessage('Hello Bob');
      expect(sendButton.disabled).toBe(false);
    });
  });
});
