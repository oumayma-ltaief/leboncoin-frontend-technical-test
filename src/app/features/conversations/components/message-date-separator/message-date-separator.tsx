import { formatDayLabel } from '../../../../shared/utils/day-label/day-label';

export function MessageDateSeparator({ date }: { date: Date }) {
  const dayLabel = formatDayLabel(date);

  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      <span className="text-xs font-medium text-content-muted">{dayLabel}</span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  );
}
