const LIGHT_THEME_PREFERRED_BY_SYSTEM = { matches: false } as MediaQueryList;

window.matchMedia = () => LIGHT_THEME_PREFERRED_BY_SYSTEM;

HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
  this.open = true;
};

HTMLDialogElement.prototype.close = function (this: HTMLDialogElement): void {
  this.open = false;
};
