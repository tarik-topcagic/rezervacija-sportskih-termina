import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatMessageNotification } from '../app/interfaces/chat-message-notification.model';
import { GroupChatMessage } from '../app/interfaces/group.model';
import { PrivateMessage } from '../app/interfaces/private-chat.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatRealtimeService {
  private hubConnection: any = null;
  private connectionConsumerCount = 0;
  private readonly incomingGroupMessageSubject = new Subject<GroupChatMessage>();
  private readonly incomingPrivateMessageSubject = new Subject<PrivateMessage>();
  private readonly incomingMessageNotificationSubject = new Subject<ChatMessageNotification>();
  readonly incomingGroupMessages$ = this.incomingGroupMessageSubject.asObservable();
  readonly incomingPrivateMessages$ = this.incomingPrivateMessageSubject.asObservable();
  readonly incomingMessageNotifications$ = this.incomingMessageNotificationSubject.asObservable();

  constructor(private authService: AuthService) {}

  async connect(): Promise<void> {
    this.connectionConsumerCount += 1;
    await this.ensureConnected();
  }

  private async ensureConnected(): Promise<void> {
    const signalR = await import('@microsoft/signalr');

    if (this.hubConnection) {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        return;
      }

      if (this.hubConnection.state === signalR.HubConnectionState.Connecting
        || this.hubConnection.state === signalR.HubConnectionState.Reconnecting) {
        return;
      }
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.getBaseApiUrl()}/hubs/chat`, {
        accessTokenFactory: () => this.authService.currentUserValue?.token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.off('ReceiveGroupMessage');
    this.hubConnection.on('ReceiveGroupMessage', (message: GroupChatMessage) => {
      this.incomingGroupMessageSubject.next(message);
    });

    this.hubConnection.off('ReceivePrivateMessage');
    this.hubConnection.on('ReceivePrivateMessage', (message: PrivateMessage) => {
      this.incomingPrivateMessageSubject.next(message);
    });

    this.hubConnection.off('ReceiveMessageNotification');
    this.hubConnection.on('ReceiveMessageNotification', (notification: ChatMessageNotification) => {
      this.incomingMessageNotificationSubject.next(notification);
    });

    try {
      await this.hubConnection.start();
    } catch (error) {
      console.error('Error connecting to chat SignalR hub:', error);
    }
  }

  async joinGroup(groupId: number): Promise<void> {
    try {
      await this.ensureConnected();
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('JoinGroup', groupId.toString());
    } catch (error) {
      console.error('Error joining SignalR group chat room:', error);
    }
  }

  async leaveGroup(groupId: number): Promise<void> {
    try {
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('LeaveGroup', groupId.toString());
    } catch (error) {
      console.error('Error leaving SignalR group chat room:', error);
    }
  }

  async joinConversation(conversationId: number): Promise<void> {
    try {
      await this.ensureConnected();
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('JoinConversation', conversationId.toString());
    } catch (error) {
      console.error('Error joining SignalR private chat room:', error);
    }
  }

  async leaveConversation(conversationId: number): Promise<void> {
    try {
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('LeaveConversation', conversationId.toString());
    } catch (error) {
      console.error('Error leaving SignalR private chat room:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectionConsumerCount > 0) {
      this.connectionConsumerCount -= 1;
    }

    if (this.connectionConsumerCount > 0) {
      return;
    }

    if (!this.hubConnection) {
      return;
    }

    try {
      const signalR = await import('@microsoft/signalr');

      this.hubConnection.off('ReceiveGroupMessage');
      this.hubConnection.off('ReceivePrivateMessage');
      this.hubConnection.off('ReceiveMessageNotification');

      if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        await this.hubConnection.stop();
      }
    } catch (error) {
      console.error('Error disconnecting from chat SignalR hub:', error);
    } finally {
      this.hubConnection = null;
    }
  }

  private getBaseApiUrl(): string {
    return environment.apiUrl.replace(/\/api$/, '');
  }
}
