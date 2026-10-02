import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorIcon } from './error-icon';

describe('ErrorIcon', () => {
  let errorIcon: ErrorIcon;
  let fixture: ComponentFixture<ErrorIcon>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorIcon);
    fixture.componentRef.setInput('errorKind', 'network');
    fixture.detectChanges();
    errorIcon = fixture.componentInstance;
  });

  it('should create', () => {
    expect(errorIcon).toBeTruthy();
  });
});
