import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'tr[app-skeleton-row]',
  imports: [NgFor, SkeletonComponent],
  templateUrl: './skeleton-table-row.component.html',
  styleUrl: './skeleton-table-row.component.scss',
})
export class SkeletonTableRowComponent {
  @Input() columnCount = 5;

  get columnsArray(): number[] {
    return Array.from({ length: this.columnCount });
  }
}
