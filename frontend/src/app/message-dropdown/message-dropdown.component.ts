import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { ChatInboxService } from '../../services/chat-inbox.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import {
  clearDropdownTimer,
  createHighlightedSet,
  incrementIf,
  isDropdownActiveForViewport,
  moveItemToTop,
  prependIfNotExists,
  startDropdownTimer,
} from '../helpers/dropdown-ui.helper';
import { ChatMessageNotification } from '../interfaces/chat-message-notification.model';
import { ChatInboxItem } from '../interfaces/chat-inbox-item.model';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-message-dropdown',
  imports: [NgIf, NgFor, NgClass, RouterModule, TranslatePipe],
  templateUrl: './message-dropdown.component.html',
  styleUrl: './message-dropdown.component.scss',
})
export class MessageDropdownComponent implements OnInit, OnDestroy {
  @Input() mode: 'desktop' | 'mobile' = 'desktop';
  @Output() opened = new EventEmitter<void>();

  username: string | null = null;
  isOpen = false;
  messages: ChatInboxItem[] = [];
  unreadCount = 0;
  highlightedMessageKeys = new Set<string>();
  relativeTimeRefreshKey = 0;

  private currentUserSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
  private privateUnreadCountSubscription?: Subscription;
  private realtimeNotificationSubscription?: Subscription;
  private readonly refreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private refreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;
  private readonly desktopMediaQuery = window.matchMedia('(min-width: 992px)');
  private readonly onViewportChange = () => this.syncViewportActivity();
  private readonly onNotificationDropdownOpened = () => this.closeMessages();
  private isActiveForViewport = false;
  private currentGroupId: number | null = null;
  private currentConversationId: number | null = null;
  private currentUserId: string | null = null;
  private joinedGroupIds = new Set<number>();
  private joinedConversationIds = new Set<number>();

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
    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.username = user ? user.username : null;
      this.currentUserId = user?.token ? this.getUserIdFromToken(user.token) : null;

      if (this.username && this.isActiveForViewport) {
        this.loadMessages();
        this.loadUnreadCount();
        return;
      }

      if (!this.username) {
        this.resetState();
      }
    });

    this.realtimeNotificationSubscription = this.chatRealtimeService.incomingMessageNotifications$.subscribe((notification) => {
      if (this.username && this.isActiveForViewport) {
        this.applyRealtimeNotification(notification);
      }
    });

    this.routeSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncCurrentChatContext(this.router.url);
      });

    this.syncCurrentChatContext(this.router.url);

    this.unreadCountSubscription = this.groupChatNotificationService.unreadCountRefresh$.subscribe(() => {
      if (this.username && this.isActiveForViewport) {
        this.loadUnreadCount();
        this.loadMessages();
      }
    });

    this.privateUnreadCountSubscription = this.privateChatNotificationService.unreadCountRefresh$.subscribe(() => {
      if (this.username && this.isActiveForViewport) {
        this.loadUnreadCount();
        this.loadMessages();
      }
    });

    this.desktopMediaQuery.addEventListener('change', this.onViewportChange);
    window.addEventListener('app-notification-dropdown-opened', this.onNotificationDropdownOpened);
    this.syncViewportActivity();
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
    this.privateUnreadCountSubscription?.unsubscribe();
    this.realtimeNotificationSubscription?.unsubscribe();
    this.desktopMediaQuery.removeEventListener('change', this.onViewportChange);
    window.removeEventListener('app-notification-dropdown-opened', this.onNotificationDropdownOpened);
    this.stopTimers();
    void this.chatRealtimeService.disconnect();
  }

  toggleMessages(event?: Event): void {
    if (this.mode === 'mobile') {
      event?.stopPropagation();
      this.router.navigate(['/poruke']);
      return;
    }

    event?.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.opened.emit();
      window.dispatchEvent(new CustomEvent('app-message-dropdown-opened'));
      this.loadMessages(true);
      return;
    }

    this.highlightedMessageKeys.clear();
  }

  openMessage(message: ChatInboxItem): void {
    if (message.type === 'group' && message.groupId) {
      this.groupChatNotificationService.markGroupAsRead(message.groupId).subscribe({
        next: () => {
          message.isRead = true;
          message.unreadCount = 0;
          this.groupChatNotificationService.notifyUnreadCountChanged();
          this.router.navigate(['/grupe', message.groupId, 'chat']);
          this.closeMessages();
        },
        error: () => {
          this.router.navigate(['/grupe', message.groupId, 'chat']);
          this.closeMessages();
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
          this.closeMessages();
        },
        error: () => {
          this.router.navigate(['/poruke/privatno', message.conversationId]);
          this.closeMessages();
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

  @HostListener('document:click', ['$event'])
  closeMessagesOnOutsideClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target?.closest('.messages-wrapper')) {
      this.closeMessages();
    }
  }

  private syncViewportActivity(): void {
    const shouldBeActive = isDropdownActiveForViewport(this.mode, this.desktopMediaQuery);

    if (shouldBeActive === this.isActiveForViewport) {
      return;
    }

    this.isActiveForViewport = shouldBeActive;

    if (shouldBeActive) {
      void this.chatRealtimeService.connect();
      this.startTimers();

      if (this.username) {
        this.loadMessages();
        this.loadUnreadCount();
      }

      return;
    }

    this.stopTimers();
    this.leaveTrackedRooms();
    void this.chatRealtimeService.disconnect();
    this.closeMessages();
  }

  private startTimers(): void {
    this.stopTimers();

    this.refreshIntervalId = startDropdownTimer(() => {
      if (!this.username) {
        return;
      }

      this.loadUnreadCount();
      this.loadMessages();
    }, this.refreshIntervalMs);

    this.relativeTimeRefreshIntervalId = startDropdownTimer(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
  }

  private stopTimers(): void {
    this.refreshIntervalId = clearDropdownTimer(this.refreshIntervalId);
    this.relativeTimeRefreshIntervalId = clearDropdownTimer(this.relativeTimeRefreshIntervalId);
  }

  private loadMessages(captureUnreadHighlights = false): void {
    if (!this.username || !this.isActiveForViewport) {
      return;
    }

    this.chatInboxService.getInboxItems().subscribe({
      next: (messages) => {
        if (captureUnreadHighlights) {
          this.highlightedMessageKeys = createHighlightedSet(
            messages,
            (message) => message.unreadCount > 0,
            (message) => this.getMessageKey(message),
          );
        }

        this.messages = messages;
        void this.syncRealtimeRooms(messages);
      },
      error: (error) => {
        console.error('Error loading chat inbox notifications:', error);
      },
    });
  }

  private loadUnreadCount(): void {
    if (!this.username || !this.isActiveForViewport) {
      return;
    }

    this.chatInboxService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (error) => {
        console.error('Error loading unread chat inbox count:', error);
      },
    });
  }

  private closeMessages(): void {
    this.isOpen = false;
    this.highlightedMessageKeys.clear();
  }

  private resetState(): void {
    this.messages = [];
    this.unreadCount = 0;
    this.highlightedMessageKeys.clear();
    this.leaveTrackedRooms();
    this.closeMessages();
  }

  private getMessageKey(message: ChatInboxItem): string {
    return `${message.type}:${message.id}`;
  }

  private async syncRealtimeRooms(messages: ChatInboxItem[]): Promise<void> {
    const nextGroupIds = new Set(messages.filter((message) => message.type === 'group' && !!message.groupId).map((message) => message.groupId as number));
    const nextConversationIds = new Set(messages.filter((message) => message.type === 'private' && !!message.conversationId).map((message) => message.conversationId as number));

    for (const groupId of this.joinedGroupIds) {
      if (!nextGroupIds.has(groupId)) {
        await this.chatRealtimeService.leaveGroup(groupId);
      }
    }

    for (const conversationId of this.joinedConversationIds) {
      if (!nextConversationIds.has(conversationId)) {
        await this.chatRealtimeService.leaveConversation(conversationId);
      }
    }

    for (const groupId of nextGroupIds) {
      if (!this.joinedGroupIds.has(groupId)) {
        await this.chatRealtimeService.joinGroup(groupId);
      }
    }

    for (const conversationId of nextConversationIds) {
      if (!this.joinedConversationIds.has(conversationId)) {
        await this.chatRealtimeService.joinConversation(conversationId);
      }
    }

    this.joinedGroupIds = nextGroupIds;
    this.joinedConversationIds = nextConversationIds;
  }

  private leaveTrackedRooms(): void {
    for (const groupId of this.joinedGroupIds) {
      void this.chatRealtimeService.leaveGroup(groupId);
    }

    for (const conversationId of this.joinedConversationIds) {
      void this.chatRealtimeService.leaveConversation(conversationId);
    }

    this.joinedGroupIds.clear();
    this.joinedConversationIds.clear();
  }

  private applyRealtimeNotification(notification: ChatMessageNotification): void {
    const existingMessage = this.messages.find((message) => {
      return notification.type === 'group'
        ? message.type === 'group' && message.groupId === notification.groupId
        : message.type === 'private' && message.conversationId === notification.conversationId;
    });

    const shouldIncrementUnread = this.shouldIncrementUnread(notification);

    if (!existingMessage) {
      const newMessage = this.createInboxItemFromNotification(notification, shouldIncrementUnread);
      this.messages = prependIfNotExists(
        this.messages,
        newMessage,
        (message) => this.getMessageKey(message) === this.getMessageKey(newMessage),
      );

      if (shouldIncrementUnread) {
        this.unreadCount = incrementIf(this.unreadCount, true);
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
      this.unreadCount = incrementIf(this.unreadCount, true);
      this.highlightedMessageKeys.add(this.getMessageKey(updatedMessage));
    }
  }

  private shouldIncrementUnread(notification: ChatMessageNotification): boolean {
    if (notification.senderUserId === this.currentUserId) {
      return false;
    }

    if (notification.type === 'group' && notification.groupId && this.currentGroupId === notification.groupId) {
      return false;
    }

    if (notification.type === 'private' && notification.conversationId && this.currentConversationId === notification.conversationId) {
      return false;
    }

    return true;
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

  private syncCurrentChatContext(url: string): void {
    const groupMatch = url.match(/^\/grupe\/(\d+)\/chat(?:$|[?#])/);
    this.currentGroupId = groupMatch ? Number(groupMatch[1]) : null;

    const conversationMatch = url.match(/^\/poruke\/privatno\/(\d+)(?:$|[?#])/);
    this.currentConversationId = conversationMatch ? Number(conversationMatch[1]) : null;
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
