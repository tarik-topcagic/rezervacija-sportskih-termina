import { Injectable } from '@angular/core';
import { CanDeactivate, CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from './can-component-deactivate';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PendingChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> | Promise<boolean> | boolean {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
