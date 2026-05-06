import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private container: HTMLElement | null = null;

  showSuccess(message: string, durationMs = 3200): void {
    const container = this.ensureContainer();
    const toast = document.createElement('div');
    toast.className = 'app-success-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <span class="app-success-toast__icon"><i class="bi bi-check-circle-fill"></i></span>
      <span class="app-success-toast__message"></span>
    `;

    const messageNode = toast.querySelector('.app-success-toast__message');
    if (messageNode) {
      messageNode.textContent = message;
    }

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add('is-hiding');
      window.setTimeout(() => {
        toast.remove();
        if (!container.childElementCount) {
          container.remove();
          this.container = null;
        }
      }, 180);
    }, durationMs);
  }

  private ensureContainer(): HTMLElement {
    if (this.container && document.body.contains(this.container)) {
      return this.container;
    }

    const container = document.createElement('div');
    container.className = 'app-success-toast-stack';
    document.body.appendChild(container);
    this.container = container;
    return container;
  }
}
