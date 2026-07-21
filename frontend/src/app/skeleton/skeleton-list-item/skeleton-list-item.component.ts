import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-skeleton-list-item',
  imports: [NgFor, NgIf, SkeletonComponent],
  templateUrl: './skeleton-list-item.component.html',
  styleUrl: './skeleton-list-item.component.scss',
})
export class SkeletonListItemComponent {
  @Input() variant: 'row' | 'card' = 'row';
  @Input() compact = false;
  @Input() showAvatar = true;
  @Input() avatarShape: 'circle' | 'square' = 'circle';
  @Input() avatarSize = '56px';
  @Input() avatarWidth?: string;
  @Input() avatarHeight?: string;
  @Input() lineWidths: string[] = ['70%', '45%', '85%'];
  @Input() actionCount = 1;
  @Input() actionWidth = '110px';
  @Input() actionWidths?: string[];
  @Input() actionHeight = '2.25rem';
  @Input() actionRadius = 'var(--app-control-radius)';

  get resolvedAvatarWidth(): string {
    return this.avatarWidth ?? this.avatarSize;
  }

  get resolvedAvatarHeight(): string {
    return this.avatarHeight ?? this.avatarSize;
  }

  get resolvedActionWidths(): string[] {
    if (this.actionWidths) {
      return this.actionWidths;
    }

    return Array.from({ length: this.actionCount }, () => this.actionWidth);
  }
}
