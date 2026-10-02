import { Component, computed, input, numberAttribute } from '@angular/core';

export type SkeletonShape = 'field' | 'row';
export type SkeletonTone = 'brand' | 'neutral';

const SKELETON_SHAPE_CLASSES: Record<SkeletonShape, string> = {
  field: 'h-[34px] w-28',
  row: 'h-12 w-full'
};
const SKELETON_TONE_CLASSES: Record<SkeletonTone, string> = {
  brand: 'bg-orange-100',
  neutral: 'bg-gray-100'
};

@Component({
  selector: 'app-skeleton',
  styleUrl: './skeleton.css',
  templateUrl: './skeleton.html',
  host: { class: 'flex flex-col gap-3', role: 'status', 'aria-label': 'Loading' }
})
export class Skeleton {
  readonly itemCount = input(1, { transform: numberAttribute });
  readonly shape = input<SkeletonShape>('row');
  readonly tone = input<SkeletonTone>('neutral');

  protected readonly itemClass = computed(() => `${SKELETON_SHAPE_CLASSES[this.shape()]} ${SKELETON_TONE_CLASSES[this.tone()]}`);
  protected readonly items = computed(() => Array.from({ length: this.itemCount() }, (_, itemIndex) => itemIndex));
}
