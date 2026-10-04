import { ComponentFixture, TestBed } from '@angular/core/testing';
import { User } from '../../../../core/users/models/user/user.interface';

import { ConversationRecipientDialog } from './conversation-recipient-dialog';

describe('ConversationRecipientDialog', () => {
  let fixture: ComponentFixture<ConversationRecipientDialog>;
  let conversationRecipientDialog: ConversationRecipientDialog;
  let conversationRecipientDialogElement: HTMLDialogElement;
  let bob: User;
  let carol: User;

  function enterRecipientSearchTerm(recipientSearchTerm: string): void {
    const recipientSearchBox = getRecipientSearchBox();
    recipientSearchBox.value = recipientSearchTerm;
    recipientSearchBox.dispatchEvent(new Event('input'));
  }

  function getDialogContent(): string {
    fixture.detectChanges();
    return conversationRecipientDialogElement.textContent;
  }

  function getListedRecipientNicknames(): string[] {
    fixture.detectChanges();
    return Array.from(conversationRecipientDialogElement.querySelectorAll('li span:last-child'), (nickname) => nickname.textContent.trim());
  }

  function getRecipientButton(recipient: User): HTMLButtonElement {
    const recipientButtons = Array.from(conversationRecipientDialogElement.querySelectorAll<HTMLButtonElement>('li button'));
    return recipientButtons.find((recipientButton) => recipientButton.textContent.includes(recipient.nickname))!;
  }

  function getRecipientSearchBox(): HTMLInputElement {
    return conversationRecipientDialogElement.querySelector('input')!;
  }

  beforeEach(() => {
    bob = { id: 2, nickname: 'Bob', token: 'token-2' };
    carol = { id: 3, nickname: 'Carol', token: 'token-3' };
    fixture = TestBed.createComponent(ConversationRecipientDialog);
    fixture.componentRef.setInput('recipientList', [bob, carol]);
    conversationRecipientDialog = fixture.componentInstance;
    fixture.detectChanges();
    conversationRecipientDialogElement = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  });

  describe('Choose recipient', () => {
    let chosenRecipient: User | undefined;

    beforeEach(() => {
      chosenRecipient = undefined;
      conversationRecipientDialog.recipientChosen.subscribe((recipient) => (chosenRecipient = recipient));
    });

    describe('When recipient choice is enabled', () => {
      it('should tell which recipient is chosen', () => {
        expect(chosenRecipient).toBeUndefined();
        getRecipientButton(carol).click();
        expect(chosenRecipient).toEqual(carol);
      });
    });

    describe('When recipient choice is disabled', () => {
      it('should not let any recipient be chosen', () => {
        fixture.componentRef.setInput('isRecipientChoiceDisabled', true);
        fixture.detectChanges();
        expect(chosenRecipient).toBeUndefined();
        getRecipientButton(carol).click();
        expect(chosenRecipient).toBeUndefined();
      });
    });
  });

  describe('Clear recipient search term', () => {
    it('should list every recipient again and keep recipient search box ready for typing', () => {
      conversationRecipientDialog.openDialog();
      enterRecipientSearchTerm('car');
      expect(getListedRecipientNicknames()).toEqual(['Carol']);
      expect(document.activeElement).not.toBe(getRecipientSearchBox());
      conversationRecipientDialogElement.querySelector<HTMLButtonElement>('button[aria-label="Clear search"]')!.click();
      expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
      expect(getRecipientSearchBox().value).toBe('');
      expect(document.activeElement).toBe(getRecipientSearchBox());
    });
  });

  describe('Close dialog', () => {
    it('should close when close button is clicked', () => {
      conversationRecipientDialog.openDialog();
      expect(conversationRecipientDialogElement.open).toBe(true);
      conversationRecipientDialogElement.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
      expect(conversationRecipientDialogElement.open).toBe(false);
    });
  });

  describe('Filter recipient list', () => {
    beforeEach(() => {
      conversationRecipientDialog.openDialog();
    });

    describe('When searched nickname matches a recipient', () => {
      it('should list only matching recipients, whatever the letter case', () => {
        expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
        enterRecipientSearchTerm(' CAR ');
        expect(getListedRecipientNicknames()).toEqual(['Carol']);
      });
    });

    describe('When searched nickname matches no recipient', () => {
      it('should show that no user is found', () => {
        expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
        enterRecipientSearchTerm('zoe');
        expect(getListedRecipientNicknames()).toEqual([]);
        expect(getDialogContent()).toContain('No user found');
      });
    });
  });

  describe('Open dialog', () => {
    describe('When there are recipients', () => {
      it('should list every recipient', () => {
        expect(conversationRecipientDialogElement.open).toBe(false);
        conversationRecipientDialog.openDialog();
        expect(conversationRecipientDialogElement.open).toBe(true);
        expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
      });

      it('should forget previous recipient search term', () => {
        conversationRecipientDialog.openDialog();
        enterRecipientSearchTerm('car');
        expect(getListedRecipientNicknames()).toEqual(['Carol']);
        conversationRecipientDialog.closeDialog();
        conversationRecipientDialog.openDialog();
        expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
      });
    });

    describe('When there is no recipient', () => {
      it('should show that there is no one to message', () => {
        fixture.componentRef.setInput('recipientList', []);
        conversationRecipientDialog.openDialog();
        expect(getDialogContent()).toContain('No one to message');
      });
    });
  });
});
