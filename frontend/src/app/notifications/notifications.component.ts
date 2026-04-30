import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { LanguageService } from '../../services/language.service';
import { NotificationService } from '../../services/notification.service';
import { AppNotification, AppNotificationType } from '../interfaces/notification.model';
import { MembershipStatus } from '../interfaces/group.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { NotificationTimeService } from '../../services/notification-time.service';
import { createHighlightedSet } from '../helpers/dropdown-ui.helper';

@Component({
  selector: 'app-notifications',
  imports: [NgClass, NgFor, NgIf, NavbarComponent, TranslatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  isLoading = true;
  highlightedNotificationIds = new Set<number>();
  respondingInvitationIds = new Set<number>();
  respondingJoinRequestIds = new Set<number>();
  notificationType = AppNotificationType;
  membershipStatus = MembershipStatus;
  private readonly notificationRefreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private notificationRefreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;
  private processedMembershipNotificationIds = new Set<number>();
  relativeTimeRefreshKey = 0;

  constructor(
    private notificationService: NotificationService,
    private groupService: GroupService,
    private languageService: LanguageService,
    private notificationTimeService: NotificationTimeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.notificationRefreshIntervalId = setInterval(() => {
      this.loadNotifications(false);
    }, this.notificationRefreshIntervalMs);
    this.relativeTimeRefreshIntervalId = setInterval(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
  }

  ngOnDestroy(): void {
    if (this.notificationRefreshIntervalId) {
      clearInterval(this.notificationRefreshIntervalId);
    }

    if (this.relativeTimeRefreshIntervalId) {
      clearInterval(this.relativeTimeRefreshIntervalId);
    }
  }

  openNotification(notification: AppNotification): void {
    if (notification.groupId) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.router.navigate(['/grupe', notification.groupId]);
        },
        error: () => this.router.navigate(['/grupe', notification.groupId]),
      });
    }
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

  isHighlightedNotification(notification: AppNotification): boolean {
    return this.highlightedNotificationIds.has(notification.id);
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

  private loadNotifications(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        if (showLoading) {
          this.highlightedNotificationIds = createHighlightedSet(
            notifications,
            (notification) => !notification.isRead,
            (notification) => notification.id,
          );
        }

        this.notifications = notifications;
        this.publishMembershipChangesFromNotifications(notifications);
        if (showLoading) {
          this.isLoading = false;
        }
        this.markNotificationsAsRead();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        if (showLoading) {
          this.isLoading = false;
        }
      },
    });
  }

  private markNotificationsAsRead(): void {
    if (!this.notifications.some((notification) => !notification.isRead)) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
        this.notificationService.notifyUnreadCountChanged();
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
}
