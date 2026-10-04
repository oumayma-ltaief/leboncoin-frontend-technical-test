import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { InfoMessage } from '../../../../shared/components/info-message/info-message';
import { UpperCasePipe } from '@angular/common';
import { User } from '../../../../core/users/models/user/user.interface';

@Component({
  imports: [InfoMessage, UpperCasePipe],
  selector: 'app-conversation-recipient-dialog',
  styleUrl: './conversation-recipient-dialog.css',
  templateUrl: './conversation-recipient-dialog.html'
})
export class ConversationRecipientDialog {
  readonly isRecipientChoiceDisabled = input(false);
  readonly recipientList = input.required<User[]>();

  readonly recipientChosen = output<User>();

  private readonly conversationRecipientDialog = viewChild.required<ElementRef<HTMLDialogElement>>('conversationRecipientDialog');
  private readonly recipientSearchBox = viewChild.required<ElementRef<HTMLInputElement>>('recipientSearchBox');

  protected readonly recipientSearchTerm = signal('');
  protected readonly recipientListMatchingSearchTerm = computed(() =>
    this.recipientList().filter((recipient) => this.hasRecipientMatchingSearchTerm(recipient))
  );

  clearRecipientSearchTerm(): void {
    this.recipientSearchTerm.set('');
    this.recipientSearchBox().nativeElement.focus();
  }

  closeDialog(): void {
    this.conversationRecipientDialog().nativeElement.close();
  }

  filterRecipientList(searchEvent: Event): void {
    this.recipientSearchTerm.set((searchEvent.target as HTMLInputElement).value);
  }

  openDialog(): void {
    this.recipientSearchTerm.set('');
    this.conversationRecipientDialog().nativeElement.showModal();
  }

  private hasRecipientMatchingSearchTerm(recipient: User): boolean {
    return recipient.nickname.toLowerCase().includes(this.recipientSearchTerm().trim().toLowerCase());
  }
}
