import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationDetail } from './conversation-detail';

describe('ConversationDetail', () => {
  let conversationDetail: ConversationDetail;
  let fixture: ComponentFixture<ConversationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationDetail]
    }).compileComponents();
    fixture = TestBed.createComponent(ConversationDetail);
    conversationDetail = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(conversationDetail).toBeTruthy();
  });
});
