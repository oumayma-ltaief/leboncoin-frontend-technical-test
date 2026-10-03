import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDateSeparator } from './message-date-separator';

describe('MessageDateSeparator', () => {
  let fixture: ComponentFixture<MessageDateSeparator>;
  let messageDateSeparator: MessageDateSeparator;

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDateSeparator);
    fixture.componentRef.setInput('date', new Date());
    fixture.detectChanges();
    messageDateSeparator = fixture.componentInstance;
  });

  it('should create', () => {
    expect(messageDateSeparator).toBeTruthy();
  });
});
