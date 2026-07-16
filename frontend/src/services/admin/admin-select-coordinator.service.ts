import { Injectable } from '@angular/core';
import { AdminSelectComponent } from '../../app/admin-select/admin-select.component';

@Injectable({ providedIn: 'root' })
export class AdminSelectCoordinatorService {
  private current: AdminSelectComponent | null = null;

  opened(instance: AdminSelectComponent): void {
    if (this.current && this.current !== instance) {
      this.current.forceClose();
    }
    this.current = instance;
  }

  closed(instance: AdminSelectComponent): void {
    if (this.current === instance) {
      this.current = null;
    }
  }
}
