import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEmpty } from './conversation-empty';

describe('ConversationEmpty', () => {
  let conversationEmpty: ConversationEmpty;
  let fixture: ComponentFixture<ConversationEmpty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEmpty]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEmpty);
    conversationEmpty = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(conversationEmpty).toBeTruthy();
  });

  it('should not prompt to select a conversation while there is none to select', () => {
    expect((fixture.nativeElement as HTMLElement).textContent.trim()).toBe('');
  });
});
