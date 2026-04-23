import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogState {
  visible: boolean;
  messageKey: string;
  previewName?: string;
  previewImageUrl?: string | null;
  resolve?: (confirmed: boolean) => void;
}

export interface ConfirmDialogOptions {
  previewName?: string;
  previewImageUrl?: string | null;
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

  confirm(messageKey: string, options: ConfirmDialogOptions = {}): Promise<boolean> {
    return new Promise((resolve) => {
      this.stateSubject.next({
        visible: true,
        messageKey,
        previewName: options.previewName,
        previewImageUrl: options.previewImageUrl,
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
      previewName: undefined,
      previewImageUrl: undefined,
    });
  }
}
