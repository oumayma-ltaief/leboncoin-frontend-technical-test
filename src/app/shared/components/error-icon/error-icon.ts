import { AppErrorKind } from '../../../core/errors/models/app-error/app-error';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-icon',
  styleUrl: './error-icon.css',
  templateUrl: './error-icon.html',
  host: { class: 'inline-flex', 'aria-hidden': 'true' }
})
export class ErrorIcon {
  readonly errorKind = input.required<AppErrorKind>();
}
