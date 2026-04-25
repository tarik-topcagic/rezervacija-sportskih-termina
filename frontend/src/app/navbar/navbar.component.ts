import { Component, HostListener, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { NotificationService } from '../../services/notification.service';
import { GroupService } from '../../services/group.service';
import { AppNotification, AppNotificationType } from '../interfaces/notification.model';
import { MembershipStatus } from '../interfaces/group.model';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';
import { NotificationTimeService } from '../../services/notification-time.service';

@Component({
  selector: 'app-navbar',
  imports: [NgIf, NgFor, NgClass, RouterModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string | null = null;
  isDropdownOpen = false;
  isNotificationsOpen = false;
  profileImageUrl: string | null = null;
  notifications: AppNotification[] = [];
  unreadNotificationsCount = 0;
  highlightedNotificationIds = new Set<number>();
  respondingInvitationIds = new Set<number>();
  respondingJoinRequestIds = new Set<number>();
  notificationType = AppNotificationType;
  membershipStatus = MembershipStatus;
  private unreadCountSubscription?: Subscription;
  private readonly notificationRefreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private notificationRefreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;
  private processedMembershipNotificationIds = new Set<number>();
  relativeTimeRefreshKey = 0;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
    private groupService: GroupService,
    private languageService: LanguageService,
    private notificationTimeService: NotificationTimeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      console.log('User from AuthService:', user);
      this.username = user ? user.username : null;
      if (user) {
        this.loadNotifications();
        this.loadUnreadNotificationsCount();
      } else {
        this.notifications = [];
        this.unreadNotificationsCount = 0;
      }
    });
    this.unreadCountSubscription = this.notificationService.unreadCountRefresh$.subscribe(() => {
      this.loadUnreadNotificationsCount();
    });
    this.notificationRefreshIntervalId = setInterval(() => {
      if (this.username) {
        this.loadUnreadNotificationsCount();
        this.loadNotifications();
      }
    }, this.notificationRefreshIntervalMs);
    this.relativeTimeRefreshIntervalId = setInterval(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
    this.getUserProfileImage();
  }

  ngAfterViewInit(): void {
    const navbarCollapse = document.getElementById('navbarColor01');
    if (navbarCollapse) {
      navbarCollapse.addEventListener('hidden.bs.collapse', () => {
        this.isDropdownOpen = false;
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  ngOnDestroy(): void {
    this.unreadCountSubscription?.unsubscribe();
    if (this.notificationRefreshIntervalId) {
      clearInterval(this.notificationRefreshIntervalId);
    }

    if (this.relativeTimeRefreshIntervalId) {
      clearInterval(this.relativeTimeRefreshIntervalId);
    }
  }

  toggleDropdown() {
    this.isNotificationsOpen = false;
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleNotifications(event?: Event): void {
    event?.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isDropdownOpen = false;
    this.closeProfileDropdown();

    if (this.isNotificationsOpen) {
      this.loadNotifications(true);
    } else {
      this.highlightedNotificationIds.clear();
    }
  }

  closeNotifications(): void {
    this.isNotificationsOpen = false;
    this.highlightedNotificationIds.clear();
  }

  private closeProfileDropdown(): void {
    const dropdownToggle = document.getElementById('userDropdown');
    const dropdownContainer = dropdownToggle?.closest('.dropdown');
    const dropdownMenu = dropdownContainer?.querySelector('.dropdown-menu');

    dropdownToggle?.setAttribute('aria-expanded', 'false');
    dropdownContainer?.classList.remove('show');
    dropdownMenu?.classList.remove('show');
    dropdownMenu?.removeAttribute('data-bs-popper');
  }

  @HostListener('document:click', ['$event'])
  closeNotificationsOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (this.isNotificationsOpen && !target?.closest('.notifications-wrapper')) {
      this.isNotificationsOpen = false;
      this.highlightedNotificationIds.clear();
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

  openNotification(notification: AppNotification): void {
    if (notification.groupId) {
      this.router.navigate(['/grupe', notification.groupId]);
      this.isNotificationsOpen = false;
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

  getUserProfileImage() {
    this.userService.getMyProfile().subscribe({
      next: (user) => {
        if (user.profilePictureUrl && user.profilePictureUrl !== 'default-profile.png') {
          this.profileImageUrl = user.profilePictureUrl;
        } else {
          this.profileImageUrl = null;
        }
      },
      error: (err) => {
        console.log('Greška pri dohvaćanju korisničke slike:', err);
        this.profileImageUrl = null;
      },
    });
  }

  private loadNotifications(captureUnreadHighlights = false): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        if (captureUnreadHighlights) {
          this.highlightedNotificationIds = new Set(
            notifications
              .filter((notification) => !notification.isRead)
              .map((notification) => notification.id),
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
}
