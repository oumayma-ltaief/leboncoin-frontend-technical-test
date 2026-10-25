export type SkeletonShape = 'conversation' | 'field' | 'message' | 'row';
export type SkeletonTone = 'brand' | 'neutral';

interface SkeletonProps {
  className?: string;
  itemCount?: number;
  shape?: SkeletonShape;
  tone?: SkeletonTone;
}

const SKELETON_TONE_CLASSES: Record<SkeletonTone, string> = {
  brand: 'bg-brand-tint',
  neutral: 'bg-surface-subtle'
};

function SkeletonItem({ shape, toneClass }: { shape: SkeletonShape; toneClass: string }) {
  switch (shape) {
    case 'conversation':
      return (
        <div className="flex items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-b-0 motion-safe:animate-pulse">
          <div className={`size-12 shrink-0 rounded-full ${toneClass}`} />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className={`h-3.5 w-28 rounded-full ${toneClass}`} />
              <div className={`h-3 w-16 rounded-full ${toneClass}`} />
            </div>
            <div className={`h-3 w-2/3 rounded-full ${toneClass}`} />
          </div>
        </div>
      );
    case 'field':
      return <div className={`h-[34px] w-28 rounded-lg motion-safe:animate-pulse ${toneClass}`} />;
    case 'message':
      return <div className={`mb-3 h-11 w-2/3 rounded-2xl odd:self-start even:self-end motion-safe:animate-pulse md:w-1/2 ${toneClass}`} />;
    default:
      return <div className={`mb-3 h-12 w-full rounded-lg motion-safe:animate-pulse ${toneClass}`} />;
  }
}

export function Skeleton({ className = '', itemCount = 1, shape = 'row', tone = 'neutral' }: SkeletonProps) {
  const items = Array.from({ length: itemCount }, (_, itemIndex) => itemIndex);
  const toneClass = SKELETON_TONE_CLASSES[tone];

  return (
    <div className={`flex flex-col ${className}`} role="status" aria-label="Loading">
      {items.map((item) => (
        <SkeletonItem key={item} shape={shape} toneClass={toneClass} />
      ))}
    </div>
  );
}
