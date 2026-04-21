import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  imports: [AsyncPipe, NgIf, TranslatePipe],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  state$;

  constructor(private confirmDialogService: ConfirmDialogService) {
    this.state$ = this.confirmDialogService.state$;
  }

  close(confirmed: boolean): void {
    this.confirmDialogService.close(confirmed);
  }
}
