import { Service, signal } from '@angular/core';

@Service()
export class Connectivity {
  private readonly isOnlineState = signal(navigator.onLine);

  readonly isOnline = this.isOnlineState.asReadonly();

  constructor() {
    window.addEventListener('online', () => this.isOnlineState.set(true));
    window.addEventListener('offline', () => this.isOnlineState.set(false));
  }
}
