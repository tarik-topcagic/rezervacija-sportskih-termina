import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChatMessageNotification } from '../app/interfaces/chat-message-notification.model';
import { ChatMessageStatusUpdate } from '../app/interfaces/chat-message-status-update.model';
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
  private connectionStartPromise: Promise<void> | null = null;
  private disconnectTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly disconnectDelayMs = 5000;
  private joinedGroupIds = new Set<number>();
  private joinedConversationIds = new Set<number>();
  private readonly incomingGroupMessageSubject = new Subject<GroupChatMessage>();
  private readonly incomingPrivateMessageSubject = new Subject<PrivateMessage>();
  private readonly incomingMessageNotificationSubject = new Subject<ChatMessageNotification>();
  private readonly incomingMessageStatusUpdateSubject = new Subject<ChatMessageStatusUpdate>();
  readonly incomingGroupMessages$ = this.incomingGroupMessageSubject.asObservable();
  readonly incomingPrivateMessages$ = this.incomingPrivateMessageSubject.asObservable();
  readonly incomingMessageNotifications$ = this.incomingMessageNotificationSubject.asObservable();
  readonly incomingMessageStatusUpdates$ = this.incomingMessageStatusUpdateSubject.asObservable();

  constructor(private authService: AuthService) {}

  async connect(): Promise<void> {
    this.clearPendingDisconnect();
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
        await this.connectionStartPromise;
        return;
      }
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.getBaseApiUrl()}/hubs/chat`, {
        accessTokenFactory: () => this.authService.currentUserValue?.token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnected(async () => {
      await this.rejoinTrackedRooms();
    });

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

    this.hubConnection.off('ReceiveMessageStatusUpdate');
    this.hubConnection.on('ReceiveMessageStatusUpdate', (update: ChatMessageStatusUpdate) => {
      this.incomingMessageStatusUpdateSubject.next(update);
    });

    try {
      this.connectionStartPromise = this.hubConnection.start()
        .then(async () => {
          await this.rejoinTrackedRooms();
        })
        .catch((error: unknown) => {
          console.error('Error connecting to chat SignalR hub:', error);
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

  async joinGroup(groupId: number): Promise<void> {
    this.joinedGroupIds.add(groupId);

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
    this.joinedGroupIds.delete(groupId);

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
    this.joinedConversationIds.add(conversationId);

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
    this.joinedConversationIds.delete(conversationId);

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

      this.hubConnection.off('ReceiveGroupMessage');
      this.hubConnection.off('ReceivePrivateMessage');
      this.hubConnection.off('ReceiveMessageNotification');
      this.hubConnection.off('ReceiveMessageStatusUpdate');

      if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        await this.hubConnection.stop();
      }
    } catch (error) {
      console.error('Error disconnecting from chat SignalR hub:', error);
    } finally {
      this.hubConnection = null;
    }
  }

  async acknowledgeGroupMessageDelivered(groupId: number, messageId: number): Promise<void> {
    try {
      await this.ensureConnected();
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('AcknowledgeGroupMessageDelivered', groupId.toString(), messageId);
    } catch (error) {
      console.error('Error acknowledging delivered group message:', error);
    }
  }

  async acknowledgeGroupMessageSeen(groupId: number, messageId: number): Promise<void> {
    try {
      await this.ensureConnected();
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('AcknowledgeGroupMessageSeen', groupId.toString(), messageId);
    } catch (error) {
      console.error('Error acknowledging seen group message:', error);
    }
  }

  async acknowledgePrivateMessageDelivered(conversationId: number, messageId: number): Promise<void> {
    try {
      await this.ensureConnected();
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('AcknowledgePrivateMessageDelivered', conversationId.toString(), messageId);
    } catch (error) {
      console.error('Error acknowledging delivered private message:', error);
    }
  }

  async acknowledgePrivateMessageSeen(conversationId: number, messageId: number): Promise<void> {
    try {
      await this.ensureConnected();
      const signalR = await import('@microsoft/signalr');

      if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
        return;
      }

      await this.hubConnection.invoke('AcknowledgePrivateMessageSeen', conversationId.toString(), messageId);
    } catch (error) {
      console.error('Error acknowledging seen private message:', error);
    }
  }

  private async rejoinTrackedRooms(): Promise<void> {
    const signalR = await import('@microsoft/signalr');

    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    for (const groupId of this.joinedGroupIds) {
      try {
        await this.hubConnection.invoke('JoinGroup', groupId.toString());
      } catch (error) {
        console.error('Error rejoining SignalR group chat room:', error);
      }
    }

    for (const conversationId of this.joinedConversationIds) {
      try {
        await this.hubConnection.invoke('JoinConversation', conversationId.toString());
      } catch (error) {
        console.error('Error rejoining SignalR private chat room:', error);
      }
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
