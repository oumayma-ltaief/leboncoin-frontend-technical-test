import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let header: Header;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(Header);
    header = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(header).toBeTruthy();
  });
});
