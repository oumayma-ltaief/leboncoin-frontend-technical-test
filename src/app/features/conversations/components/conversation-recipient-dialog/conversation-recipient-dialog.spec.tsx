import { act, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import type { User } from '../../../../core/users/models/user/user';

import { ConversationRecipientDialog, type ConversationRecipientDialogHandle } from './conversation-recipient-dialog';

describe('ConversationRecipientDialog', () => {
  let conversationRecipientDialog: { current: ConversationRecipientDialogHandle | null };
  let conversationRecipientDialogElement: HTMLDialogElement;
  let conversationRecipientDialogView: ReturnType<typeof render>;
  let bob: User;
  let carol: User;
  let chooseRecipient: (recipient: User) => void;

  function closeDialog(): void {
    act(() => {
      conversationRecipientDialog.current?.closeDialog();
    });
  }

  function enterRecipientSearchTerm(recipientSearchTerm: string): void {
    fireEvent.change(getRecipientSearchBox(), { target: { value: recipientSearchTerm } });
  }

  function getListedRecipientNicknames(): string[] {
    return Array.from(conversationRecipientDialogElement.querySelectorAll('li span:last-child'), (nickname) => nickname.textContent.trim());
  }

  function getRecipientButton(recipient: User): HTMLButtonElement {
    const recipientButtons = Array.from(conversationRecipientDialogElement.querySelectorAll<HTMLButtonElement>('li button'));
    return recipientButtons.find((recipientButton) => recipientButton.textContent.includes(recipient.nickname))!;
  }

  function getRecipientSearchBox(): HTMLInputElement {
    return conversationRecipientDialogElement.querySelector('input')!;
  }

  function openDialog(): void {
    act(() => {
      conversationRecipientDialog.current?.openDialog();
    });
  }

  function renderDialog(recipientList: User[], isRecipientChoiceDisabled = false): void {
    conversationRecipientDialogView.rerender(
      <ConversationRecipientDialog
        ref={conversationRecipientDialog}
        isRecipientChoiceDisabled={isRecipientChoiceDisabled}
        recipientList={recipientList}
        onRecipientChoose={chooseRecipient}
      />
    );
  }

  beforeEach(() => {
    bob = { id: 2, nickname: 'Bob', token: 'token-2' };
    carol = { id: 3, nickname: 'Carol', token: 'token-3' };
    chooseRecipient = vi.fn();
    conversationRecipientDialog = createRef<ConversationRecipientDialogHandle>();
    conversationRecipientDialogView = render(
      <ConversationRecipientDialog ref={conversationRecipientDialog} recipientList={[bob, carol]} onRecipientChoose={chooseRecipient} />
    );
    conversationRecipientDialogElement = conversationRecipientDialogView.container.querySelector('dialog')!;
  });

  describe('Choose recipient', () => {
    describe('When recipient choice is enabled', () => {
      it('should tell which recipient is chosen', () => {
        expect(chooseRecipient).not.toHaveBeenCalled();
        fireEvent.click(getRecipientButton(carol));
        expect(chooseRecipient).toHaveBeenCalledWith(carol);
      });
    });

    describe('When recipient choice is disabled', () => {
      it('should not let any recipient be chosen', () => {
        renderDialog([bob, carol], true);
        expect(chooseRecipient).not.toHaveBeenCalled();
        fireEvent.click(getRecipientButton(carol));
        expect(chooseRecipient).not.toHaveBeenCalled();
      });
    });
  });

  describe('Clear recipient search term', () => {
    it('should list every recipient again and keep recipient search box ready for typing', () => {
      openDialog();
      enterRecipientSearchTerm('car');
      expect(getListedRecipientNicknames()).toEqual(['Carol']);
      expect(document.activeElement).not.toBe(getRecipientSearchBox());
      fireEvent.click(conversationRecipientDialogElement.querySelector('button[aria-label="Clear search"]')!);
      expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
      expect(getRecipientSearchBox().value).toBe('');
      expect(document.activeElement).toBe(getRecipientSearchBox());
    });
  });

  describe('Close dialog', () => {
    it('should close when close button is clicked', () => {
      openDialog();
      expect(conversationRecipientDialogElement.open).toBe(true);
      fireEvent.click(conversationRecipientDialogElement.querySelector('button[aria-label="Close"]')!);
      expect(conversationRecipientDialogElement.open).toBe(false);
    });
  });

  describe('Filter recipient list', () => {
    beforeEach(() => {
      openDialog();
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
        expect(conversationRecipientDialogElement.textContent).toContain('No user found');
      });
    });
  });

  describe('Open dialog', () => {
    describe('When there are recipients', () => {
      it('should list every recipient', () => {
        expect(conversationRecipientDialogElement.open).toBe(false);
        openDialog();
        expect(conversationRecipientDialogElement.open).toBe(true);
        expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
      });

      it('should forget previous recipient search term', () => {
        openDialog();
        enterRecipientSearchTerm('car');
        expect(getListedRecipientNicknames()).toEqual(['Carol']);
        closeDialog();
        openDialog();
        expect(getListedRecipientNicknames()).toEqual(['Bob', 'Carol']);
      });
    });

    describe('When there is no recipient', () => {
      it('should show that there is no one to message', () => {
        renderDialog([]);
        openDialog();
        expect(conversationRecipientDialogElement.textContent).toContain('No one to message');
      });
    });
  });
});
