import { Component, computed, input, linkedSignal, output } from '@angular/core';

export const MAX_MESSAGE_LENGTH = 1000;

@Component({
  selector: 'app-message-form',
  styleUrl: './message-form.css',
  templateUrl: './message-form.html'
})
export class MessageForm {
  readonly conversationId = input.required<number>();
  readonly isMessageSendingDisabled = input(false);

  readonly messageSubmitted = output<string>();

  protected readonly maxMessageLength = MAX_MESSAGE_LENGTH;
  protected readonly messageBody = linkedSignal({ source: this.conversationId, computation: () => '' });
  protected readonly isMessageReadyToSend = computed(
    () => !this.isMessageSendingDisabled() && this.isMessageBodyFilled() && this.isMessageBodyWithinMaxLength()
  );

  submitMessage(submitEvent: Event): void {
    submitEvent.preventDefault();
    if (this.isMessageReadyToSend()) {
      this.messageSubmitted.emit(this.getTrimmedMessageBody());
      this.messageBody.set('');
    }
  }

  updateMessageBody(inputEvent: Event): void {
    this.messageBody.set((inputEvent.target as HTMLTextAreaElement).value);
  }

  private getTrimmedMessageBody(): string {
    return this.messageBody().trim();
  }

  private isMessageBodyFilled(): boolean {
    return !!this.getTrimmedMessageBody();
  }

  private isMessageBodyWithinMaxLength(): boolean {
    return this.getTrimmedMessageBody().length <= MAX_MESSAGE_LENGTH;
  }
}
