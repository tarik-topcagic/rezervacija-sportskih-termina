import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatInboxService } from '../../services/chat-inbox.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
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
  private unreadCountSubscription?: Subscription;
  private privateUnreadCountSubscription?: Subscription;
  private readonly refreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private refreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;
  private readonly desktopMediaQuery = window.matchMedia('(min-width: 992px)');
  private readonly onViewportChange = () => this.syncViewportActivity();
  private readonly onNotificationDropdownOpened = () => this.closeMessages();
  private isActiveForViewport = false;

  constructor(
    private authService: AuthService,
    private chatInboxService: ChatInboxService,
    private groupChatNotificationService: GroupChatNotificationService,
    private privateChatNotificationService: PrivateChatNotificationService,
    private notificationTimeService: NotificationTimeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.username = user ? user.username : null;

      if (this.username && this.isActiveForViewport) {
        this.loadMessages();
        this.loadUnreadCount();
        return;
      }

      if (!this.username) {
        this.resetState();
      }
    });

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
    this.unreadCountSubscription?.unsubscribe();
    this.privateUnreadCountSubscription?.unsubscribe();
    this.desktopMediaQuery.removeEventListener('change', this.onViewportChange);
    window.removeEventListener('app-notification-dropdown-opened', this.onNotificationDropdownOpened);
    this.stopTimers();
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
    const shouldBeActive = this.mode === 'desktop'
      ? this.desktopMediaQuery.matches
      : !this.desktopMediaQuery.matches;

    if (shouldBeActive === this.isActiveForViewport) {
      return;
    }

    this.isActiveForViewport = shouldBeActive;

    if (shouldBeActive) {
      this.startTimers();

      if (this.username) {
        this.loadMessages();
        this.loadUnreadCount();
      }

      return;
    }

    this.stopTimers();
    this.closeMessages();
  }

  private startTimers(): void {
    this.stopTimers();

    this.refreshIntervalId = setInterval(() => {
      if (!this.username) {
        return;
      }

      this.loadUnreadCount();
      this.loadMessages();
    }, this.refreshIntervalMs);

    this.relativeTimeRefreshIntervalId = setInterval(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
  }

  private stopTimers(): void {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = undefined;
    }

    if (this.relativeTimeRefreshIntervalId) {
      clearInterval(this.relativeTimeRefreshIntervalId);
      this.relativeTimeRefreshIntervalId = undefined;
    }
  }

  private loadMessages(captureUnreadHighlights = false): void {
    if (!this.username || !this.isActiveForViewport) {
      return;
    }

    this.chatInboxService.getInboxItems().subscribe({
      next: (messages) => {
        if (captureUnreadHighlights) {
          this.highlightedMessageKeys = new Set(
            messages
              .filter((message) => message.unreadCount > 0)
              .map((message) => this.getMessageKey(message)),
          );
        }

        this.messages = messages;
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
    this.closeMessages();
  }

  private getMessageKey(message: ChatInboxItem): string {
    return `${message.type}:${message.id}`;
  }
}
