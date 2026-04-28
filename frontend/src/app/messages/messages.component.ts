import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { GroupChatNotification } from '../interfaces/group-chat-notification.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-messages',
  imports: [NgFor, NgIf, NavbarComponent, TranslatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages: GroupChatNotification[] = [];
  isLoading = true;
  relativeTimeRefreshKey = 0;

  private readonly messagesRefreshIntervalMs = 30000;
  private readonly relativeTimeRefreshIntervalMs = 60000;
  private messagesRefreshIntervalId?: ReturnType<typeof setInterval>;
  private relativeTimeRefreshIntervalId?: ReturnType<typeof setInterval>;

  constructor(
    private groupChatNotificationService: GroupChatNotificationService,
    private notificationTimeService: NotificationTimeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadMessages();

    this.messagesRefreshIntervalId = setInterval(() => {
      this.loadMessages(false);
    }, this.messagesRefreshIntervalMs);

    this.relativeTimeRefreshIntervalId = setInterval(() => {
      this.relativeTimeRefreshKey += 1;
    }, this.relativeTimeRefreshIntervalMs);
  }

  ngOnDestroy(): void {
    if (this.messagesRefreshIntervalId) {
      clearInterval(this.messagesRefreshIntervalId);
    }

    if (this.relativeTimeRefreshIntervalId) {
      clearInterval(this.relativeTimeRefreshIntervalId);
    }
  }

  openMessage(message: GroupChatNotification): void {
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
  }

  getMessageAge(message: GroupChatNotification): string {
    return this.notificationTimeService.formatRelativeTime(message.createdAt);
  }

  hasUnreadMessages(message: GroupChatNotification): boolean {
    return message.unreadCount > 0;
  }

  private loadMessages(showLoading = true): void {
    if (showLoading) {
      this.isLoading = true;
    }

    this.groupChatNotificationService.getChatNotifications().subscribe({
      next: (messages) => {
        this.messages = messages;

        if (showLoading) {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading chat message notifications:', error);

        if (showLoading) {
          this.isLoading = false;
        }
      },
    });
  }
}
