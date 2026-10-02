import { Service, signal } from '@angular/core';

@Service()
export class Connectivity {
  private readonly isBrowserOnline = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.isBrowserOnline.set(true));
    window.addEventListener('offline', () => this.isBrowserOnline.set(false));
  }

  isOnline(): boolean {
    return this.isBrowserOnline();
  }
}
