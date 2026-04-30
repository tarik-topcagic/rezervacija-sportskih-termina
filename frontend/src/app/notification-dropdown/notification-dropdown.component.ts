import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { SystemNotificationRealtimeService } from '../../services/system-notification-realtime.service';
import {
  clearDropdownTimer,
  createHighlightedSet,
  incrementIf,
  isDropdownActiveForViewport,
  prependIfNotExists,
  startDropdownTimer,
} from '../helpers/dropdown-ui.helper';
import { MembershipStatus } from '../interfaces/group.model';
import { AppNotification, AppNotificationType } from '../interfaces/notification.model';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-notification-dropdown',
  imports: [NgIf, NgFor, NgClass, RouterModule, TranslatePipe],
  templateUrl: './notification-dropdown.component.html',
  styleUrl: './notification-dropdown.component.scss',
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  @Input() mode: 'desktop' | 'mobile' = 'desktop';
  @Output() opened = new EventEmitter<void>();

  username: string | null = null;
  isNotificationsOpen = false;
  notifications: AppNotification[] = [];
  unreadNotificationsCount = 0;
  highlightedNotificationIds = new Set<number>();
  respondingInvitationIds = new Set<number>();
  respondingJoinRequestIds = new Set<number>();
  notificationType = AppNotificationType;
  membershipStatus = MembershipStatus;
  relativeTimeRefreshKey = 0;

  private currentUserSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
  private realtimeNotificationSubscription?: Subscription;
  private readonly notificationRefreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private notificationRefreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;
  private processedMembershipNotificationIds = new Set<number>();
  private readonly desktopMediaQuery = window.matchMedia('(min-width: 992px)');
  private readonly onViewportChange = () => this.syncViewportActivity();
  private readonly onMessageDropdownOpened = () => this.closeNotifications();
  private isActiveForViewport = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private groupService: GroupService,
    private languageService: LanguageService,
    private notificationTimeService: NotificationTimeService,
    private systemNotificationRealtimeService: SystemNotificationRealtimeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.username = user ? user.username : null;

      if (this.username && this.isActiveForViewport) {
        this.loadNotifications();
        this.loadUnreadNotificationsCount();
        return;
      }

      if (!this.username) {
        this.resetNotificationsState();
      }
    });

    this.realtimeNotificationSubscription = this.systemNotificationRealtimeService.incomingSystemNotifications$.subscribe((notification) => {
      if (this.username && this.isActiveForViewport) {
        this.applyRealtimeNotification(notification);
      }
    });

    this.unreadCountSubscription = this.notificationService.unreadCountRefresh$.subscribe(() => {
      if (this.username && this.isActiveForViewport) {
        this.loadUnreadNotificationsCount();
      }
    });

    this.desktopMediaQuery.addEventListener('change', this.onViewportChange);
    window.addEventListener('app-message-dropdown-opened', this.onMessageDropdownOpened);
    this.syncViewportActivity();
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
    this.realtimeNotificationSubscription?.unsubscribe();
    this.desktopMediaQuery.removeEventListener('change', this.onViewportChange);
    window.removeEventListener('app-message-dropdown-opened', this.onMessageDropdownOpened);
    this.stopTimers();
    void this.systemNotificationRealtimeService.disconnect();
  }

  toggleNotifications(event?: Event): void {
    if (this.mode !== 'desktop') {
      return;
    }

    event?.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;

    if (this.isNotificationsOpen) {
      this.opened.emit();
      window.dispatchEvent(new CustomEvent('app-notification-dropdown-opened'));
      this.loadNotifications(true);
      return;
    }

    this.highlightedNotificationIds.clear();
  }

  openNotification(notification: AppNotification): void {
    if (notification.groupId) {
      this.router.navigate(['/grupe', notification.groupId]);
      this.closeNotifications();
    }
  }

  acceptInvitation(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.respondToInvitation(notification, true);
  }

  declineInvitation(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.respondToInvitation(notification, false);
  }

  acceptJoinRequest(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.respondToJoinRequest(notification, true);
  }

  declineJoinRequest(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.respondToJoinRequest(notification, false);
  }

  getNotificationText(notification: AppNotification): string {
    const groupName = this.formatNotificationGroupName(notification.groupName);

    if (notification.type === AppNotificationType.GroupInvitationReceived) {
      return this.interpolate('invitationReceivedNotification', { groupName });
    }

    if (notification.type === AppNotificationType.GroupJoinRequestReceived) {
      return this.interpolate('joinRequestReceivedNotification', {
        userName: notification.actorName || '',
        groupName,
      });
    }

    if (notification.type === AppNotificationType.GroupJoinRequestAccepted) {
      return this.interpolate('joinRequestAcceptedNotification', { groupName });
    }

    return this.interpolate('invitationAcceptedNotification', {
      userName: notification.actorName || '',
      groupName,
    });
  }

  getNotificationAge(notification: AppNotification): string {
    return this.notificationTimeService.formatRelativeTime(notification.createdAt);
  }

  canRespondToInvitation(notification: AppNotification): boolean {
    return notification.type === AppNotificationType.GroupInvitationReceived
      && !!notification.membershipId
      && notification.invitationStatus === MembershipStatus.PendingInvitation;
  }

  canRespondToJoinRequest(notification: AppNotification): boolean {
    return notification.type === AppNotificationType.GroupJoinRequestReceived
      && !!notification.groupId
      && !!notification.membershipId
      && notification.membershipStatus === MembershipStatus.PendingJoinRequest;
  }

  isResponding(notification: AppNotification): boolean {
    return !!notification.membershipId
      && (this.respondingInvitationIds.has(notification.membershipId)
        || this.respondingJoinRequestIds.has(notification.membershipId));
  }

  isHighlightedNotification(notification: AppNotification): boolean {
    return this.highlightedNotificationIds.has(notification.id);
  }

  @HostListener('document:click', ['$event'])
  closeNotificationsOnOutsideClick(event: MouseEvent): void {
    if (this.mode !== 'desktop' || !this.isNotificationsOpen) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target?.closest('.notifications-wrapper')) {
      this.closeNotifications();
    }
  }

  private syncViewportActivity(): void {
    const shouldBeActive = isDropdownActiveForViewport(this.mode, this.desktopMediaQuery);

    if (shouldBeActive === this.isActiveForViewport) {
      return;
    }

    this.isActiveForViewport = shouldBeActive;

    if (shouldBeActive) {
      void this.systemNotificationRealtimeService.connect();
      this.startTimers();

      if (this.username) {
        this.loadNotifications();
        this.loadUnreadNotificationsCount();
      }

      return;
    }

    this.stopTimers();
    void this.systemNotificationRealtimeService.disconnect();
    this.closeNotifications();
  }

  private startTimers(): void {
    this.stopTimers();

    this.notificationRefreshIntervalId = startDropdownTimer(() => {
      if (!this.username) {
        return;
      }

      this.loadUnreadNotificationsCount();
      this.loadNotifications();
    }, this.notificationRefreshIntervalMs);

    this.relativeTimeRefreshIntervalId = startDropdownTimer(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
  }

  private stopTimers(): void {
    this.notificationRefreshIntervalId = clearDropdownTimer(this.notificationRefreshIntervalId);
    this.relativeTimeRefreshIntervalId = clearDropdownTimer(this.relativeTimeRefreshIntervalId);
  }

  private closeNotifications(): void {
    this.isNotificationsOpen = false;
    this.highlightedNotificationIds.clear();
  }

  private loadNotifications(captureUnreadHighlights = false): void {
    if (!this.username || !this.isActiveForViewport) {
      return;
    }

    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        if (captureUnreadHighlights) {
          this.highlightedNotificationIds = createHighlightedSet(
            notifications,
            (notification) => !notification.isRead,
            (notification) => notification.id,
          );
        }

        this.notifications = notifications;
        this.publishMembershipChangesFromNotifications(notifications);

        if (captureUnreadHighlights) {
          this.markNotificationsAsRead();
        }
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      },
    });
  }

  private loadUnreadNotificationsCount(): void {
    if (!this.username || !this.isActiveForViewport) {
      return;
    }

    this.notificationService.getUnreadCount().subscribe({
      next: (response) => {
        this.unreadNotificationsCount = response.count;
      },
      error: (error) => {
        console.error('Error loading notification count:', error);
      },
    });
  }

  private markNotificationsAsRead(): void {
    if (!this.unreadNotificationsCount) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.unreadNotificationsCount = 0;
        this.notificationService.notifyUnreadCountChanged();
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
      },
    });
  }

  private respondToInvitation(notification: AppNotification, accept: boolean): void {
    if (!notification.membershipId || this.isResponding(notification)) {
      return;
    }

    this.respondingInvitationIds.add(notification.membershipId);

    this.groupService.respondInvite(notification.membershipId, accept, notification.groupId ?? undefined).subscribe({
      next: () => {
        this.respondingInvitationIds.delete(notification.membershipId!);
        notification.invitationStatus = accept ? MembershipStatus.Accepted : MembershipStatus.Declined;
        notification.isRead = true;
        this.loadNotifications();
        this.loadUnreadNotificationsCount();
      },
      error: (error) => {
        this.respondingInvitationIds.delete(notification.membershipId!);
        console.error('Error responding to invitation:', error);
      },
    });
  }

  private respondToJoinRequest(notification: AppNotification, accept: boolean): void {
    if (!notification.groupId || !notification.membershipId || this.isResponding(notification)) {
      return;
    }

    this.respondingJoinRequestIds.add(notification.membershipId);

    this.groupService.respondJoinRequest(notification.groupId, notification.membershipId, accept).subscribe({
      next: () => {
        this.respondingJoinRequestIds.delete(notification.membershipId!);
        notification.membershipStatus = accept ? MembershipStatus.Accepted : MembershipStatus.Declined;
        notification.isRead = true;
        this.loadNotifications();
        this.loadUnreadNotificationsCount();
      },
      error: (error) => {
        this.respondingJoinRequestIds.delete(notification.membershipId!);
        console.error('Error responding to join request:', error);
      },
    });
  }

  private interpolate(key: string, values: Record<string, string>): string {
    return Object.entries(values).reduce(
      (text, [name, value]) => text.replace(`{${name}}`, value),
      this.languageService.translate(key),
    );
  }

  private formatNotificationGroupName(groupName?: string | null): string {
    return groupName ? `"${groupName}"` : '';
  }

  private publishMembershipChangesFromNotifications(notifications: AppNotification[]): void {
    for (const notification of notifications) {
      if (notification.type !== AppNotificationType.GroupJoinRequestAccepted
        || this.processedMembershipNotificationIds.has(notification.id)) {
        continue;
      }

      this.processedMembershipNotificationIds.add(notification.id);
      this.groupService.notifyMembershipChanged();
    }
  }

  private resetNotificationsState(): void {
    this.notifications = [];
    this.unreadNotificationsCount = 0;
    this.highlightedNotificationIds.clear();
    this.respondingInvitationIds.clear();
    this.respondingJoinRequestIds.clear();
    this.closeNotifications();
  }

  private applyRealtimeNotification(notification: AppNotification): void {
    const nextNotifications = prependIfNotExists(
      this.notifications,
      notification,
      (existingNotification) => existingNotification.id === notification.id,
    );

    if (nextNotifications === this.notifications) {
      return;
    }

    this.notifications = nextNotifications;
    this.unreadNotificationsCount = incrementIf(this.unreadNotificationsCount, !notification.isRead);

    if (!notification.isRead) {
      this.highlightedNotificationIds.add(notification.id);
    }

    this.publishMembershipChangesFromNotifications([notification]);
  }
}
