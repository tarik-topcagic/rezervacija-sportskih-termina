import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { GroupChatNotification } from '../interfaces/group-chat-notification.model';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-message-dropdown',
  imports: [NgIf, NgFor, RouterModule, TranslatePipe],
  templateUrl: './message-dropdown.component.html',
  styleUrl: './message-dropdown.component.scss',
})
export class MessageDropdownComponent implements OnInit, OnDestroy {
  @Input() mode: 'desktop' | 'mobile' = 'desktop';
  @Output() opened = new EventEmitter<void>();

  username: string | null = null;
  isOpen = false;
  messages: GroupChatNotification[] = [];
  unreadCount = 0;
  highlightedGroupIds = new Set<number>();
  relativeTimeRefreshKey = 0;

  private currentUserSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
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
    private groupChatNotificationService: GroupChatNotificationService,
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

    this.desktopMediaQuery.addEventListener('change', this.onViewportChange);
    window.addEventListener('app-notification-dropdown-opened', this.onNotificationDropdownOpened);
    this.syncViewportActivity();
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
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

    this.highlightedGroupIds.clear();
  }

  openMessage(message: GroupChatNotification): void {
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
  }

  getMessageAge(message: GroupChatNotification): string {
    return this.notificationTimeService.formatRelativeTime(message.createdAt);
  }

  hasUnreadMessages(message: GroupChatNotification): boolean {
    return message.unreadCount > 0;
  }

  isHighlightedMessage(message: GroupChatNotification): boolean {
    return this.highlightedGroupIds.has(message.groupId);
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

    this.groupChatNotificationService.getChatNotifications().subscribe({
      next: (messages) => {
        if (captureUnreadHighlights) {
          this.highlightedGroupIds = new Set(
            messages
              .filter((message) => message.unreadCount > 0)
              .map((message) => message.groupId),
          );
        }

        this.messages = messages;
      },
      error: (error) => {
        console.error('Error loading chat message notifications:', error);
      },
    });
  }

  private loadUnreadCount(): void {
    if (!this.username || !this.isActiveForViewport) {
      return;
    }

    this.groupChatNotificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadCount = response.count;
      },
      error: (error) => {
        console.error('Error loading unread chat message count:', error);
      },
    });
  }

  private closeMessages(): void {
    this.isOpen = false;
    this.highlightedGroupIds.clear();
  }

  private resetState(): void {
    this.messages = [];
    this.unreadCount = 0;
    this.highlightedGroupIds.clear();
    this.closeMessages();
  }
}
