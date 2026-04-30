import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatInboxService } from '../../services/chat-inbox.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { NotificationTimeService } from '../../services/notification-time.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import { createHighlightedSet } from '../helpers/dropdown-ui.helper';
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

  constructor(
    private chatInboxService: ChatInboxService,
    private groupChatNotificationService: GroupChatNotificationService,
    private privateChatNotificationService: PrivateChatNotificationService,
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
}
