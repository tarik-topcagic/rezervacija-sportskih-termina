import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { ChatInboxService } from '../../services/chat-inbox.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import { createHighlightedSet, moveItemToTop, prependIfNotExists } from '../helpers/dropdown-ui.helper';
import { ChatMessageNotification } from '../interfaces/chat-message-notification.model';
import { ChatInboxItem } from '../interfaces/chat-inbox-item.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-messages',
  imports: [NgFor, NgIf, NgClass, NavbarComponent, TranslatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: ChatInboxItem[] = [];
  isLoading = true;
  highlightedMessageKeys = new Set<string>();
  relativeTimeRefreshKey = 0;

  private readonly messagesRefreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private messagesRefreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;
  private currentUserId: string | null = null;
  private currentUserSubscription?: Subscription;
  private realtimeNotificationSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private chatRealtimeService: ChatRealtimeService,
    private chatInboxService: ChatInboxService,
    private groupChatNotificationService: GroupChatNotificationService,
    private privateChatNotificationService: PrivateChatNotificationService,
    private notificationTimeService: NotificationTimeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    void this.chatRealtimeService.connect();

    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUserId = user?.token ? this.getUserIdFromToken(user.token) : null;
    });

    this.realtimeNotificationSubscription = this.chatRealtimeService.incomingMessageNotifications$.subscribe((notification) => {
      this.applyRealtimeNotification(notification);
    });

    this.loadMessages();

    this.messagesRefreshIntervalId = setInterval(() => {
      this.loadMessages(false);
    }, this.messagesRefreshIntervalMs);

    this.relativeTimeRefreshIntervalId = setInterval(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
    this.realtimeNotificationSubscription?.unsubscribe();

    if (this.messagesRefreshIntervalId) {
      clearInterval(this.messagesRefreshIntervalId);
    }

    if (this.relativeTimeRefreshIntervalId) {
      clearInterval(this.relativeTimeRefreshIntervalId);
    }

    void this.chatRealtimeService.disconnect();
  }

  openMessage(message: ChatInboxItem): void {
    if (message.type === 'group' && message.groupId) {
      this.groupChatNotificationService.markGroupAsRead(message.groupId).subscribe({
        next: () => {
          message.isRead = true;
          message.unreadCount = 0;
          this.groupChatNotificationService.notifyUnreadCountChanged();
          this.router.navigate(['/grupe', message.groupId, 'chat']);
        },
        error: () => {
          this.router.navigate(['/grupe', message.groupId, 'chat']);
        },
      });
      return;
    }

    if (message.type === 'private' && message.conversationId) {
      this.privateChatNotificationService.markConversationAsRead(message.conversationId).subscribe({
        next: () => {
          message.isRead = true;
          message.unreadCount = 0;
          this.privateChatNotificationService.notifyUnreadCountChanged();
          this.router.navigate(['/poruke/privatno', message.conversationId]);
        },
        error: () => {
          this.router.navigate(['/poruke/privatno', message.conversationId]);
        },
      });
    }
  }

  getMessageAge(message: ChatInboxItem): string {
    return this.notificationTimeService.formatRelativeTime(message.createdAt);
  }

  hasUnreadMessages(message: ChatInboxItem): boolean {
    return message.unreadCount > 0;
  }

  isHighlightedMessage(message: ChatInboxItem): boolean {
    return this.highlightedMessageKeys.has(this.getMessageKey(message));
  }

  private loadMessages(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.chatInboxService.getInboxItems().subscribe({
      next: (messages) => {
        if (showLoading) {
          this.highlightedMessageKeys = createHighlightedSet(
            messages,
            (message) => message.unreadCount > 0,
            (message) => this.getMessageKey(message),
          );
        }

        this.messages = messages;

        if (showLoading) {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading chat inbox notifications:', error);

        if (showLoading) {
          this.isLoading = false;
        }
      },
    });
  }

  private getMessageKey(message: ChatInboxItem): string {
    return `${message.type}:${message.id}`;
  }

  private applyRealtimeNotification(notification: ChatMessageNotification): void {
    const existingMessage = this.messages.find((message) => {
      return notification.type === 'group'
        ? message.type === 'group' && message.groupId === notification.groupId
        : message.type === 'private' && message.conversationId === notification.conversationId;
    });

    const shouldIncrementUnread = notification.senderUserId !== this.currentUserId;

    if (!existingMessage) {
      const newMessage = this.createInboxItemFromNotification(notification, shouldIncrementUnread);
      this.messages = prependIfNotExists(
        this.messages,
        newMessage,
        (message) => this.getMessageKey(message) === this.getMessageKey(newMessage),
      );

      if (shouldIncrementUnread) {
        this.highlightedMessageKeys.add(this.getMessageKey(newMessage));
      }

      return;
    }

    const updatedMessage: ChatInboxItem = {
      ...existingMessage,
      subtitle: notification.type === 'group' ? notification.senderName : existingMessage.subtitle,
      preview: notification.preview,
      createdAt: notification.createdAt,
      isRead: !shouldIncrementUnread,
      unreadCount: shouldIncrementUnread ? existingMessage.unreadCount + 1 : existingMessage.unreadCount,
    };

    this.messages = moveItemToTop(
      this.messages,
      updatedMessage,
      (message) => this.getMessageKey(message) === this.getMessageKey(existingMessage),
    );

    if (shouldIncrementUnread) {
      this.highlightedMessageKeys.add(this.getMessageKey(updatedMessage));
    }
  }

  private createInboxItemFromNotification(
    notification: ChatMessageNotification,
    shouldIncrementUnread: boolean,
  ): ChatInboxItem {
    if (notification.type === 'group') {
      return {
        type: 'group',
        id: notification.groupId ?? 0,
        title: notification.groupId ? `Grupa #${notification.groupId}` : notification.senderName,
        subtitle: notification.senderName,
        preview: notification.preview,
        createdAt: notification.createdAt,
        unreadCount: shouldIncrementUnread ? 1 : 0,
        isRead: !shouldIncrementUnread,
        imageUrl: null,
        fallbackIcon: 'bi-people',
        groupId: notification.groupId ?? undefined,
      };
    }

    return {
      type: 'private',
      id: notification.conversationId ?? 0,
      title: notification.senderName,
      preview: notification.preview,
      createdAt: notification.createdAt,
      unreadCount: shouldIncrementUnread ? 1 : 0,
      isRead: !shouldIncrementUnread,
      imageUrl: null,
      fallbackIcon: 'bi-person',
      conversationId: notification.conversationId ?? undefined,
    };
  }

  private getUserIdFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      return payload.nameid ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? null;
    } catch {
      return null;
    }
  }
}
