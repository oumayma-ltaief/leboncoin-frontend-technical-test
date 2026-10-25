import { useSyncExternalStore } from 'react';

const CONNECTIVITY_EVENTS = ['offline', 'online'];

function isOnline(): boolean {
  return navigator.onLine;
}

function isOnlineOnServer(): boolean {
  return true;
}

function subscribeToConnectivityChanges(onConnectivityChange: () => void): () => void {
  CONNECTIVITY_EVENTS.forEach((connectivityEvent) => {
    window.addEventListener(connectivityEvent, onConnectivityChange);
  });
  return () => {
    CONNECTIVITY_EVENTS.forEach((connectivityEvent) => {
      window.removeEventListener(connectivityEvent, onConnectivityChange);
    });
  };
}

export function useConnectivity(): { isOnline: boolean } {
  return { isOnline: useSyncExternalStore(subscribeToConnectivityChanges, isOnline, isOnlineOnServer) };
}
