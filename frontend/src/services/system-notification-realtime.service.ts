import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppNotification } from '../app/interfaces/notification.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SystemNotificationRealtimeService {
  private hubConnection: any = null;
  private connectionConsumerCount = 0;
  private connectionStartPromise: Promise<void> | null = null;
  private disconnectTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly disconnectDelayMs = 5000;
  private readonly incomingSystemNotificationSubject = new Subject<AppNotification>();
  readonly incomingSystemNotifications$ = this.incomingSystemNotificationSubject.asObservable();

  constructor(private authService: AuthService) {}

  async connect(): Promise<void> {
    this.clearPendingDisconnect();
    this.connectionConsumerCount += 1;
    await this.ensureConnected();
  }

  async disconnect(): Promise<void> {
    if (this.connectionConsumerCount > 0) {
      this.connectionConsumerCount -= 1;
    }

    if (this.connectionConsumerCount > 0) {
      return;
    }

    this.clearPendingDisconnect();
    this.disconnectTimeoutId = setTimeout(() => {
      void this.stopConnectionIfUnused();
    }, this.disconnectDelayMs);
  }

  private async stopConnectionIfUnused(): Promise<void> {
    this.disconnectTimeoutId = undefined;

    if (this.connectionConsumerCount > 0 || !this.hubConnection) {
      return;
    }

    try {
      const signalR = await import('@microsoft/signalr');

      this.hubConnection.off('ReceiveSystemNotification');

      if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        await this.hubConnection.stop();
      }
    } catch (error) {
      console.error('Error disconnecting from system notification SignalR hub:', error);
    } finally {
      this.hubConnection = null;
    }
  }

  private async ensureConnected(): Promise<void> {
    const signalR = await import('@microsoft/signalr');

    if (this.hubConnection) {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        return;
      }

      if (this.hubConnection.state === signalR.HubConnectionState.Connecting
        || this.hubConnection.state === signalR.HubConnectionState.Reconnecting) {
        await this.connectionStartPromise;
        return;
      }
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.getBaseApiUrl()}/hubs/system-notifications`, {
        accessTokenFactory: () => this.authService.currentUserValue?.token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.off('ReceiveSystemNotification');
    this.hubConnection.on('ReceiveSystemNotification', (notification: AppNotification) => {
      this.incomingSystemNotificationSubject.next(notification);
    });

    try {
      this.connectionStartPromise = this.hubConnection.start()
        .catch((error: unknown) => {
          console.error('Error connecting to system notification SignalR hub:', error);
          throw error;
        })
        .finally(() => {
          this.connectionStartPromise = null;
        });

      await this.connectionStartPromise;
    } catch (error) {
      // Already logged above; keep callers resilient.
    }
  }

  private clearPendingDisconnect(): void {
    if (!this.disconnectTimeoutId) {
      return;
    }

    clearTimeout(this.disconnectTimeoutId);
    this.disconnectTimeoutId = undefined;
  }

  private getBaseApiUrl(): string {
    return environment.apiUrl.replace(/\/api$/, '');
  }
}
