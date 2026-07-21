import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

const DEFAULT_LINE_WIDTHS = ['95%', '88%', '70%', '60%', '50%'];

@Component({
  selector: 'app-skeleton-text-block',
  imports: [NgFor, NgIf, SkeletonComponent],
  templateUrl: './skeleton-text-block.component.html',
  styleUrl: './skeleton-text-block.component.scss',
})
export class SkeletonTextBlockComponent {
  @Input() showHeading = true;
  @Input() headingWidth = '40%';
  @Input() lineCount = 3;
  @Input() lineWidths?: string[];
  @Input() align: 'left' | 'center' = 'left';

  get resolvedLineWidths(): string[] {
    if (this.lineWidths) {
      return this.lineWidths;
    }

    return Array.from({ length: this.lineCount }, (_, index) => DEFAULT_LINE_WIDTHS[index % DEFAULT_LINE_WIDTHS.length]);
  }
}
