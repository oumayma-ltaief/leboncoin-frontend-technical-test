import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { useConnectivity } from './use-connectivity';

function ConnectivityLabel() {
  return useConnectivity().isOnline ? 'online' : 'offline';
}

describe('useConnectivity', () => {
  let connectivity: { current: { isOnline: boolean } };

  function loseConnection(): void {
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
  }

  function mockNavigatorOnLineStatus(isNavigatorOnLine: boolean): void {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(isNavigatorOnLine);
  }

  function regainConnection(): void {
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Detect connection changes', () => {
    describe('When the browser is online', () => {
      beforeEach(() => {
        mockNavigatorOnLineStatus(true);
        connectivity = renderHook(() => useConnectivity()).result;
      });

      it('should become offline when the connection is lost', () => {
        expect(connectivity.current.isOnline).toBe(true);
        mockNavigatorOnLineStatus(false);
        loseConnection();
        expect(connectivity.current.isOnline).toBe(false);
      });
    });

    describe('When the browser is offline', () => {
      beforeEach(() => {
        mockNavigatorOnLineStatus(false);
        connectivity = renderHook(() => useConnectivity()).result;
      });

      it('should be rendered online on the server, which cannot know the browser connection', () => {
        expect(renderToString(createElement(ConnectivityLabel))).toBe('online');
      });

      it('should become online when the connection is regained', () => {
        expect(connectivity.current.isOnline).toBe(false);
        mockNavigatorOnLineStatus(true);
        regainConnection();
        expect(connectivity.current.isOnline).toBe(true);
      });
    });
  });
});
