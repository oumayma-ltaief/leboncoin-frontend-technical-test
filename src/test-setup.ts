import { notifyManager } from '@tanstack/react-query';
import { resetNavigation } from './test-navigation';

const LIGHT_THEME_PREFERRED_BY_SYSTEM = { matches: false } as MediaQueryList;

vi.mock('next/navigation', () => import('./test-navigation'));

window.matchMedia = () => LIGHT_THEME_PREFERRED_BY_SYSTEM;

HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
  this.open = true;
};

HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
  this.open = false;
};

notifyManager.setScheduler(queueMicrotask);

afterEach(() => {
  resetNavigation();
});
