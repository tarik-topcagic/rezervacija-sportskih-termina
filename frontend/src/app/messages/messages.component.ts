import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { ChatInboxService } from '../../services/chat-inbox.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { PresenceService } from '../../services/presence.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import { createHighlightedSet, moveItemToTop, prependIfNotExists } from '../helpers/dropdown-ui.helper';
import { buildNotificationPreviewText, mergeInboxItemsWithReactionOverlays } from '../helpers/chat-list.helper';
import { ChatMessageNotification } from '../interfaces/chat-message-notification.model';
import { ChatInboxItem } from '../interfaces/chat-inbox-item.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

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
  private presenceSubscription?: Subscription;
  private privatePresenceByUserId = new Map<string, boolean>();
  private groupPresenceByGroupId = new Map<number, boolean>();
  private reactionOverlaysByKey = new Map<string, ChatInboxItem>();

  constructor(
    private authService: AuthService,
    private chatRealtimeService: ChatRealtimeService,
    private chatInboxService: ChatInboxService,
    private groupChatNotificationService: GroupChatNotificationService,
    private privateChatNotificationService: PrivateChatNotificationService,
    private notificationTimeService: NotificationTimeService,
    private presenceService: PresenceService,
    private router: Router,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    void this.chatRealtimeService.connect();

    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUserId = user?.token ? this.getUserIdFromToken(user.token) : null;
    });

    this.realtimeNotificationSubscription = this.chatRealtimeService.incomingMessageNotifications$.subscribe((notification) => {
      this.applyRealtimeNotification(notification);
    });

    this.presenceSubscription = this.presenceService.presenceUpdates$.subscribe((update) => {
      this.applyPresenceUpdate(update.userId, update.isOnline);
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
    this.presenceSubscription?.unsubscribe();

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
          this.router.navigate(['/groups', message.groupId, 'chat']);
        },
        error: () => {
          this.router.navigate(['/groups', message.groupId, 'chat']);
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
          this.router.navigate(['/messages/private', message.conversationId]);
        },
        error: () => {
          this.router.navigate(['/messages/private', message.conversationId]);
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

  shouldShowPresenceDot(message: ChatInboxItem): boolean {
    if (message.type === 'private') {
      return !!message.otherUserId
        && message.otherUserId !== this.currentUserId
        && this.privatePresenceByUserId.get(message.otherUserId) === true;
    }

    return !!message.groupId && this.groupPresenceByGroupId.get(message.groupId) === true;
  }

  private loadMessages(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.chatInboxService.getInboxItems().subscribe({
      next: (messages) => {
        const mergedMessages = mergeInboxItemsWithReactionOverlays(messages, this.reactionOverlaysByKey);

        if (showLoading) {
          this.highlightedMessageKeys = createHighlightedSet(
            mergedMessages,
            (message) => message.unreadCount > 0,
            (message) => this.getMessageKey(message),
          );
        }

        this.messages = mergedMessages;
        this.syncPresenceIndicators(mergedMessages);

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

      if (notification.kind === 'reaction') {
        this.reactionOverlaysByKey.set(this.getMessageKey(newMessage), newMessage);
      }

      if (shouldIncrementUnread) {
        this.highlightedMessageKeys.add(this.getMessageKey(newMessage));
      }

      this.syncPresenceIndicators(this.messages);

      return;
    }

    const updatedMessage: ChatInboxItem = {
      ...existingMessage,
      subtitle: notification.type === 'group' ? notification.senderName : existingMessage.subtitle,
      preview: buildNotificationPreviewText(notification, (key) => this.languageService.translate(key)),
      createdAt: notification.createdAt,
      isRead: !shouldIncrementUnread,
      unreadCount: shouldIncrementUnread ? existingMessage.unreadCount + 1 : existingMessage.unreadCount,
    };

    if (notification.kind === 'reaction') {
      this.reactionOverlaysByKey.set(this.getMessageKey(updatedMessage), updatedMessage);
    }

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
    const preview = buildNotificationPreviewText(notification, (key) => this.languageService.translate(key));

    if (notification.type === 'group') {
      return {
        type: 'group',
        id: notification.groupId ?? 0,
        title: notification.groupId ? `Grupa #${notification.groupId}` : notification.senderName,
        subtitle: notification.senderName,
        preview,
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
      otherUserId: notification.senderUserId,
      preview,
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
      return payload.sub
        ?? payload.nameid
        ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? null;
    } catch {
      return null;
    }
  }

  private syncPresenceIndicators(messages: ChatInboxItem[]): void {
    const privateUserIds = new Set(
      messages
        .filter((message) => message.type === 'private' && !!message.otherUserId && message.otherUserId !== this.currentUserId)
        .map((message) => message.otherUserId as string),
    );
    const groupIds = new Set(
      messages
        .filter((message) => message.type === 'group' && !!message.groupId)
        .map((message) => message.groupId as number),
    );

    for (const userId of Array.from(this.privatePresenceByUserId.keys())) {
      if (!privateUserIds.has(userId)) {
        this.privatePresenceByUserId.delete(userId);
      }
    }

    for (const groupId of Array.from(this.groupPresenceByGroupId.keys())) {
      if (!groupIds.has(groupId)) {
        this.groupPresenceByGroupId.delete(groupId);
      }
    }

    for (const userId of privateUserIds) {
      if (!this.privatePresenceByUserId.has(userId)) {
        this.loadPrivatePresence(userId);
      }
    }

    for (const groupId of groupIds) {
      if (!this.groupPresenceByGroupId.has(groupId)) {
        this.loadGroupPresence(groupId);
      }
    }
  }

  private loadPrivatePresence(userId: string): void {
    this.presenceService.getUserPresence(userId).subscribe({
      next: (presence) => {
        this.privatePresenceByUserId.set(userId, presence.isOnline);
      },
      error: () => {
        this.privatePresenceByUserId.set(userId, false);
      },
    });
  }

  private loadGroupPresence(groupId: number): void {
    this.presenceService.getGroupPresence(groupId).subscribe({
      next: (presence) => {
        this.groupPresenceByGroupId.set(groupId, presence.onlineUserIds.length > 0);
      },
      error: () => {
        this.groupPresenceByGroupId.set(groupId, false);
      },
    });
  }

  private applyPresenceUpdate(userId: string, isOnline: boolean): void {
    if (userId === this.currentUserId) {
      for (const message of this.messages) {
        if (message.type === 'group' && message.groupId) {
          this.loadGroupPresence(message.groupId);
        }
      }

      return;
    }

    let affectedPrivateChat = false;

    for (const message of this.messages) {
      if (message.type === 'private' && message.otherUserId === userId) {
        this.privatePresenceByUserId.set(userId, isOnline);
        affectedPrivateChat = true;
      }
    }

    if (affectedPrivateChat) {
      return;
    }

    for (const message of this.messages) {
      if (message.type === 'group' && message.groupId) {
        this.loadGroupPresence(message.groupId);
      }
    }
  }
}
