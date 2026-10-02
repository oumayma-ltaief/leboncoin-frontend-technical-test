import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let fixture: ComponentFixture<Skeleton>;

  function getItems(): HTMLElement[] {
    fixture.detectChanges();
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('div'));
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Skeleton);
  });

  it('should show as many items as requested', () => {
    expect(getItems()).toHaveLength(1);
    fixture.componentRef.setInput('itemCount', 3);
    expect(getItems()).toHaveLength(3);
  });

  it('should style its items according to the given shape and tone', () => {
    expect(getItems()[0].classList).toContain('h-12');
    expect(getItems()[0].classList).toContain('bg-gray-100');
    fixture.componentRef.setInput('shape', 'field');
    fixture.componentRef.setInput('tone', 'brand');
    expect(getItems()[0].classList).toContain('w-28');
    expect(getItems()[0].classList).toContain('bg-orange-100');
  });
});
