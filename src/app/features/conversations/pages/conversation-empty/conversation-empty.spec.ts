import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversationEmpty } from './conversation-empty';

describe('ConversationEmpty', () => {
  let component: ConversationEmpty;
  let fixture: ComponentFixture<ConversationEmpty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEmpty]
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEmpty);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
