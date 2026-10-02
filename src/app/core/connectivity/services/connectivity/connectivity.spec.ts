import { TestBed } from '@angular/core/testing';

import { Connectivity } from './connectivity';

describe('Connectivity', () => {
  let connectivity: Connectivity;

  function loseConnection(): void {
    window.dispatchEvent(new Event('offline'));
  }

  function mockNavigatorOnLineStatus(isNavigatorOnLine: boolean): void {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(isNavigatorOnLine);
  }

  function regainConnection(): void {
    window.dispatchEvent(new Event('online'));
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Detect connection changes', () => {
    describe('When the browser is online', () => {
      beforeEach(() => {
        mockNavigatorOnLineStatus(true);
        connectivity = TestBed.inject(Connectivity);
      });

      it('should become offline when the connection is lost', () => {
        expect(connectivity.isOnline()).toBe(true);
        loseConnection();
        expect(connectivity.isOnline()).toBe(false);
      });
    });

    describe('When the browser is offline', () => {
      beforeEach(() => {
        mockNavigatorOnLineStatus(false);
        connectivity = TestBed.inject(Connectivity);
      });

      it('should become online when the connection is regained', () => {
        expect(connectivity.isOnline()).toBe(false);
        regainConnection();
        expect(connectivity.isOnline()).toBe(true);
      });
    });
  });
});
