import { Component, input } from '@angular/core';
import { DayLabelPipe } from '../../../../shared/pipes/day-label/day-label';

@Component({
  imports: [DayLabelPipe],
  selector: 'app-message-date-separator',
  styleUrl: './message-date-separator.css',
  templateUrl: './message-date-separator.html',
  host: { class: 'flex items-center gap-3 py-1' }
})
export class MessageDateSeparator {
  readonly date = input.required<Date>();
}
