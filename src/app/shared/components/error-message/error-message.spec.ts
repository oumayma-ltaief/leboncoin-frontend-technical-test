import { AppError } from '../../../core/errors/models/app-error/app-error';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessage } from './error-message';

describe('ErrorMessage', () => {
  let fixture: ComponentFixture<ErrorMessage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorMessage);
    fixture.componentRef.setInput('error', new AppError('network'));
    fixture.componentRef.setInput('title', "Couldn't load users");
    fixture.detectChanges();
  });

  it('should emit a retry event when try again button is clicked', () => {
    let retryCount = 0;
    fixture.componentInstance.retry.subscribe(() => retryCount++);
    expect(retryCount).toBe(0);
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    expect(retryCount).toBe(1);
  });
});
