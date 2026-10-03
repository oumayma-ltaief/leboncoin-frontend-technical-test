import { formatDate } from '@angular/common';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

const DAY_AND_MONTH_FORMAT = 'MMMM d';
const DAYS_PER_WEEK = 7;
const FULL_DATE_FORMAT = 'MMMM d, y';
const MILLISECONDS_PER_DAY = 86_400_000;
const RECENT_DAY_LABELS = ['Today', 'Yesterday'];
const WEEKDAY_FORMAT = 'EEEE';

@Pipe({ name: 'dayLabel' })
export class DayLabelPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(date: Date): string {
    return RECENT_DAY_LABELS[this.getElapsedDayCount(date)] ?? formatDate(date, this.getDateFormat(date), this.locale);
  }

  private getDateFormat(date: Date): string {
    if (this.getElapsedDayCount(date) < DAYS_PER_WEEK) {
      return WEEKDAY_FORMAT;
    }
    return this.isCurrentYear(date) ? DAY_AND_MONTH_FORMAT : FULL_DATE_FORMAT;
  }

  private getElapsedDayCount(date: Date): number {
    return Math.round((this.getStartOfDay(new Date()) - this.getStartOfDay(date)) / MILLISECONDS_PER_DAY);
  }

  private getStartOfDay(date: Date): number {
    return new Date(date).setHours(0, 0, 0, 0);
  }

  private isCurrentYear(date: Date): boolean {
    return date.getFullYear() === new Date().getFullYear();
  }
}
