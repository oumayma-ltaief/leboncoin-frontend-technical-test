import { booleanAttribute, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  imports: [NgTemplateOutlet],
  selector: 'app-info-message',
  styleUrl: './info-message.css',
  templateUrl: './info-message.html',
  host: { class: 'flex', role: 'status' }
})
export class InfoMessage {
  readonly description = input<string>();
  readonly isCompact = input(false, { transform: booleanAttribute });
  readonly title = input.required<string>();
}
