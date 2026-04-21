import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogState {
  visible: boolean;
  messageKey: string;
  resolve?: (confirmed: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private stateSubject = new BehaviorSubject<ConfirmDialogState>({
    visible: false,
    messageKey: '',
  });

  state$ = this.stateSubject.asObservable();

  confirm(messageKey: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.stateSubject.next({
        visible: true,
        messageKey,
        resolve,
      });
    });
  }

  close(confirmed: boolean): void {
    const state = this.stateSubject.value;
    state.resolve?.(confirmed);
    this.stateSubject.next({
      visible: false,
      messageKey: '',
    });
  }
}
