import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoMessage } from './info-message';

describe('InfoMessage', () => {
  let fixture: ComponentFixture<InfoMessage>;
  let infoMessage: InfoMessage;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoMessage);
    fixture.componentRef.setInput('title', 'No conversations yet');
    fixture.detectChanges();
    infoMessage = fixture.componentInstance;
  });

  it('should create', () => {
    expect(infoMessage).toBeTruthy();
  });
});
