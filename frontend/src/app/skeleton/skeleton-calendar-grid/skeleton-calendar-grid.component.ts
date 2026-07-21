import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-calendar-grid',
  imports: [NgFor, SkeletonComponent],
  templateUrl: './skeleton-calendar-grid.component.html',
  styleUrl: './skeleton-calendar-grid.component.scss',
})
export class SkeletonCalendarGridComponent {
  @Input() dayCount = 5;
  @Input() rowCount = 6;
  @Input() isMobileLayout = false;

  get daysArray(): number[] {
    return Array.from({ length: this.dayCount });
  }

  get rowsArray(): number[] {
    return Array.from({ length: this.rowCount });
  }

  get gridTemplateColumns(): string {
    return this.isMobileLayout
      ? `56px repeat(${this.dayCount}, 132px)`
      : `88px repeat(${this.dayCount}, minmax(140px, 1fr))`;
  }
}
