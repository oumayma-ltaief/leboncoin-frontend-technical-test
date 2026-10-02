import { AppError } from '../../../core/errors/models/app-error/app-error';
import { booleanAttribute, Component, input, output } from '@angular/core';
import { ErrorIcon } from '../error-icon/error-icon';

@Component({
  imports: [ErrorIcon],
  selector: 'app-error-message',
  styleUrl: './error-message.css',
  templateUrl: './error-message.html',
  host: { class: 'flex', role: 'alert' }
})
export class ErrorMessage {
  readonly error = input.required<AppError>();
  readonly isCompact = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();

  readonly retry = output<void>();
}
