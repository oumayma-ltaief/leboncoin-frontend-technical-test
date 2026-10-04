import { Component, computed, input, numberAttribute } from '@angular/core';

export type SkeletonShape = 'conversation' | 'field' | 'message' | 'row';
export type SkeletonTone = 'brand' | 'neutral';

const SKELETON_TONE_CLASSES: Record<SkeletonTone, string> = {
  brand: 'bg-brand-tint',
  neutral: 'bg-surface-subtle'
};

@Component({
  selector: 'app-skeleton',
  styleUrl: './skeleton.css',
  templateUrl: './skeleton.html',
  host: { class: 'flex flex-col', role: 'status', 'aria-label': 'Loading' }
})
export class Skeleton {
  readonly itemCount = input(1, { transform: numberAttribute });
  readonly shape = input<SkeletonShape>('row');
  readonly tone = input<SkeletonTone>('neutral');

  protected readonly items = computed(() => Array.from({ length: this.itemCount() }, (_, itemIndex) => itemIndex));
  protected readonly toneClass = computed(() => SKELETON_TONE_CLASSES[this.tone()]);
}
