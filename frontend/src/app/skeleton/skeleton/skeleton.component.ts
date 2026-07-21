import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  imports: [],
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() radius?: string;
  @Input() circle = false;

  @HostBinding('style.width') get hostWidth(): string {
    return this.width;
  }

  @HostBinding('style.height') get hostHeight(): string {
    return this.height;
  }
}
