import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAX_MESSAGE_LENGTH, MessageForm } from './message-form';

describe('MessageForm', () => {
  let conversationId: number;
  let fixture: ComponentFixture<MessageForm>;
  let messageBox: HTMLTextAreaElement;
  let sendButton: HTMLButtonElement;
  let submittedMessageBody: string | undefined;

  function writeMessage(messageBody: string): void {
    messageBox.value = messageBody;
    messageBox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    submittedMessageBody = undefined;
    conversationId = 1;
    fixture = TestBed.createComponent(MessageForm);
    fixture.componentRef.setInput('conversationId', conversationId);
    fixture.componentInstance.messageSubmitted.subscribe((messageBody) => (submittedMessageBody = messageBody));
    fixture.detectChanges();
    const messageFormElement = fixture.nativeElement as HTMLElement;
    messageBox = messageFormElement.querySelector('textarea')!;
    sendButton = messageFormElement.querySelector('button')!;
  });

  describe('Follow open conversation', () => {
    it('should empty the message box when another conversation is opened', () => {
      const otherConversationId = 2;
      writeMessage('Hello Bob');
      expect(messageBox.value).toBe('Hello Bob');
      fixture.componentRef.setInput('conversationId', otherConversationId);
      fixture.detectChanges();
      expect(messageBox.value).toBe('');
    });
  });

  describe('Submit message', () => {
    describe('When a message is written', () => {
      it('should submit it without surrounding spaces and empty the message box', () => {
        writeMessage('  Hello Bob  ');
        expect(submittedMessageBody).toBeUndefined();
        sendButton.click();
        fixture.detectChanges();
        expect(submittedMessageBody).toBe('Hello Bob');
        expect(messageBox.value).toBe('');
      });

      it('should submit it when Enter is pressed', () => {
        writeMessage('Hello Bob');
        expect(submittedMessageBody).toBeUndefined();
        messageBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(submittedMessageBody).toBe('Hello Bob');
      });
    });

    describe('When message is empty', () => {
      it('should not submit it', () => {
        writeMessage('   ');
        expect(sendButton.disabled).toBe(true);
        messageBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(submittedMessageBody).toBeUndefined();
      });
    });

    describe('When message is longer than the maximum length', () => {
      it('should not submit it', () => {
        writeMessage('a'.repeat(MAX_MESSAGE_LENGTH));
        expect(sendButton.disabled).toBe(false);
        writeMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1));
        expect(sendButton.disabled).toBe(true);
        messageBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(submittedMessageBody).toBeUndefined();
      });
    });

    describe('When message sending is disabled', () => {
      it('should not submit the written message and keep it in the message box', () => {
        writeMessage('Hello Bob');
        expect(sendButton.disabled).toBe(false);
        fixture.componentRef.setInput('isMessageSendingDisabled', true);
        fixture.detectChanges();
        expect(sendButton.disabled).toBe(true);
        messageBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(submittedMessageBody).toBeUndefined();
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
