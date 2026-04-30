import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { GroupService } from '../../services/group.service';
import { LanguageService } from '../../services/language.service';
import {
  appendMessageIfNotExists,
  applyStatusUpdateToMessages,
  mergeStatusUpdates as mergePendingStatusUpdates,
} from '../helpers/chat-status.helper';
import { scrollToBottom, shouldShowScrollButton } from '../helpers/chat-ui.helper';
import { ChatMessageStatusUpdate } from '../interfaces/chat-message-status-update.model';
import { GroupChatMessage, GroupDetails } from '../interfaces/group.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-group-chat',
  imports: [DatePipe, NgIf, NgFor, NgClass, FormsModule, RouterLink, NavbarComponent, TranslatePipe],
  templateUrl: './group-chat.component.html',
  styleUrl: './group-chat.component.scss',
})
export class GroupChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  group: GroupDetails | null = null;
  messages: GroupChatMessage[] = [];
  messageText = '';
  isLoading = true;
  isSending = false;
  showScrollToBottomButton = false;
  errorMessage = '';
  private routeSubscription?: Subscription;
  private realtimeMessageSubscription?: Subscription;
  private realtimeStatusSubscription?: Subscription;
  private connectedGroupId: number | null = null;
  private pendingStatusUpdates = new Map<number, ChatMessageStatusUpdate>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatRealtimeService: ChatRealtimeService,
    private groupService: GroupService,
    private groupChatNotificationService: GroupChatNotificationService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    void this.chatRealtimeService.connect();

    this.realtimeMessageSubscription = this.chatRealtimeService.incomingGroupMessages$.subscribe((message) => {
      this.handleIncomingRealtimeMessage(message);
    });

    this.realtimeStatusSubscription = this.chatRealtimeService.incomingMessageStatusUpdates$.subscribe((update) => {
      this.handleStatusUpdate(update);
    });

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const groupId = Number(params.get('id'));

      if (!groupId) {
        this.router.navigate(['/grupe']);
        return;
      }

      this.resetViewState();
      void this.initializeGroupChat(groupId);
    });
  }

  ngAfterViewInit(): void {
    this.scrollMessagesToBottom();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.realtimeMessageSubscription?.unsubscribe();
    this.realtimeStatusSubscription?.unsubscribe();
    if (this.connectedGroupId !== null) {
      void this.chatRealtimeService.leaveGroup(this.connectedGroupId);
    }
    void this.chatRealtimeService.disconnect();
  }

  sendMessage(): void {
    const trimmedMessage = this.messageText.trim();
    if (!this.group?.id || !trimmedMessage || this.isSending) {
      return;
    }

    this.isSending = true;
    this.errorMessage = '';

    this.groupService.sendGroupMessage(this.group.id, trimmedMessage).subscribe({
      next: (message) => {
        const appendResult = appendMessageIfNotExists(
          this.messages,
          message,
          this.pendingStatusUpdates,
          this.mapSeenByStatusFields,
        );
        this.messages = appendResult.messages;

        if (!appendResult.appended) {
          this.messageText = '';
          this.isSending = false;
          return;
        }

        this.messageText = '';
        this.isSending = false;
        this.scrollMessagesToBottom('smooth');
      },
      error: (error) => {
        this.isSending = false;
        this.errorMessage = this.languageService.translate('groupChatSendError');
        console.error('Error sending group chat message:', error);
      },
    });
  }

  isOwnMessage(message: GroupChatMessage): boolean {
    return message.senderUserId === this.group?.currentUserId;
  }

  canSendMessage(): boolean {
    return !!this.group?.isMember && !!this.messageText.trim() && !this.isSending;
  }

  onMessagesScroll(): void {
    this.syncScrollButtonVisibility();
  }

  scrollMessagesToLatest(): void {
    this.scrollMessagesToBottom('smooth');
  }

  shouldShowMessageStatus(message: GroupChatMessage): boolean {
    if (!this.isLatestChatMessage(message)) {
      return false;
    }

    return this.shouldShowSeenByMembers(message)
      || this.isOwnMessage(message);
  }

  getMessageStatusLabel(message: GroupChatMessage): string {
    if (message.seenAt) {
      return this.languageService.translate('seen');
    }

    if (message.deliveredAt) {
      return this.languageService.translate('delivered');
    }

    return this.languageService.translate('sent');
  }

  private loadChat(groupId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.groupService.getGroupDetails(groupId).subscribe({
      next: (group) => {
        if (!group.isMember) {
          this.router.navigate(['/grupe', groupId]);
          return;
        }

        this.group = group;
        this.loadMessages(groupId);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.languageService.translate('groupChatLoadError');
        console.error('Error loading group chat details:', error);
      },
    });
  }

  private loadMessages(groupId: number): void {
    this.groupService.getGroupMessages(groupId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
        this.scrollMessagesToBottom();
        this.markCurrentGroupChatAsRead(groupId);
        this.acknowledgeLoadedMessages();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.languageService.translate('groupChatLoadError');
        console.error('Error loading group chat messages:', error);
      },
    });
  }

  private resetViewState(): void {
    this.group = null;
    this.messages = [];
    this.messageText = '';
    this.isLoading = true;
    this.isSending = false;
    this.showScrollToBottomButton = false;
    this.errorMessage = '';
    this.pendingStatusUpdates.clear();
  }

  private async setupRealtime(groupId: number): Promise<void> {
    if (this.connectedGroupId !== null && this.connectedGroupId !== groupId) {
      await this.chatRealtimeService.leaveGroup(this.connectedGroupId);
    }

    this.connectedGroupId = groupId;
    await this.chatRealtimeService.joinGroup(groupId);
  }

  private async initializeGroupChat(groupId: number): Promise<void> {
    await this.setupRealtime(groupId);
    this.loadChat(groupId);
  }

  private scrollMessagesToBottom(behavior: ScrollBehavior = 'auto'): void {
    scrollToBottom(() => this.messagesContainer?.nativeElement, behavior);
    this.syncScrollButtonVisibility();
  }

  private syncScrollButtonVisibility(): void {
    this.showScrollToBottomButton = shouldShowScrollButton(() => this.messagesContainer?.nativeElement);
  }

  private markCurrentGroupChatAsRead(groupId: number): void {
    this.groupChatNotificationService.markGroupAsRead(groupId).subscribe({
      next: () => {
        this.groupChatNotificationService.notifyUnreadCountChanged();
      },
      error: (error) => {
        console.error('Error marking group chat as read:', error);
      },
    });
  }

  private handleIncomingRealtimeMessage(message: GroupChatMessage): void {
    if (!this.group?.id || message.groupId !== this.group.id) {
      return;
    }

    const appendResult = appendMessageIfNotExists(
      this.messages,
      message,
      this.pendingStatusUpdates,
      this.mapSeenByStatusFields,
    );
    this.messages = appendResult.messages;

    if (!appendResult.appended) {
      return;
    }

    this.scrollMessagesToBottom('smooth');
    this.markCurrentGroupChatAsRead(message.groupId);
    this.acknowledgeIncomingMessage(message);
  }

  private handleStatusUpdate(update: ChatMessageStatusUpdate): void {
    if (update.chatType !== 'group' || !this.group?.id || update.groupId !== this.group.id) {
      return;
    }

    const updateResult = applyStatusUpdateToMessages(
      this.messages,
      update,
      this.mapSeenByStatusFields,
    );
    this.messages = updateResult.messages;

    if (!updateResult.didUpdateExistingMessage) {
      this.pendingStatusUpdates.set(update.messageId, this.mergeStatusUpdates(
        this.pendingStatusUpdates.get(update.messageId),
        update,
      ));
    }
  }

  private acknowledgeIncomingMessage(message: GroupChatMessage): void {
    if (!this.group?.id || this.isOwnMessage(message)) {
      return;
    }

    void this.chatRealtimeService.acknowledgeGroupMessageDelivered(this.group.id, message.id);
    void this.chatRealtimeService.acknowledgeGroupMessageSeen(this.group.id, message.id);
  }

  private acknowledgeLoadedMessages(): void {
    if (!this.group?.id) {
      return;
    }

    const latestIncomingMessageId = [...this.messages]
      .reverse()
      .find((message) => !this.isOwnMessage(message))?.id;

    for (const message of this.messages) {
      if (this.isOwnMessage(message)) {
        continue;
      }

      void this.chatRealtimeService.acknowledgeGroupMessageDelivered(this.group.id, message.id);

      if (latestIncomingMessageId === message.id) {
        void this.chatRealtimeService.acknowledgeGroupMessageSeen(this.group.id, message.id);
      }
    }
  }

  private mapSeenByStatusFields(
    message: GroupChatMessage,
    update: ChatMessageStatusUpdate,
  ): Partial<GroupChatMessage> {
    return {
      seenByUserIds: update.seenByUserIds ?? message.seenByUserIds ?? [],
      seenByUserNames: update.seenByUserNames ?? message.seenByUserNames ?? [],
      seenByUserProfilePictureUrls: update.seenByUserProfilePictureUrls ?? message.seenByUserProfilePictureUrls ?? [],
    };
  }

  private mergeStatusUpdates(
    currentUpdate: ChatMessageStatusUpdate | undefined,
    nextUpdate: ChatMessageStatusUpdate,
  ): ChatMessageStatusUpdate {
    return mergePendingStatusUpdates(currentUpdate, nextUpdate);
  }

  shouldShowSeenByMembers(message: GroupChatMessage): boolean {
    return !!this.group
      && this.isLatestChatMessage(message)
      && this.getSeenByEntries(message).length > 0;
  }

  getSeenByAvatarItems(message: GroupChatMessage): { name: string; profilePictureUrl: string | null }[] {
    return this.getSeenByEntries(message)
      .slice(0, 2);
  }

  getRemainingSeenByCount(message: GroupChatMessage): number {
    const totalSeenCount = this.getSeenByEntries(message).length;
    return Math.max(totalSeenCount - this.getSeenByAvatarItems(message).length, 0);
  }

  private getSeenByEntries(message: GroupChatMessage): { userId: string; name: string; profilePictureUrl: string | null }[] {
    const userIds = message.seenByUserIds ?? [];
    const names = message.seenByUserNames ?? [];
    const profilePictureUrls = message.seenByUserProfilePictureUrls ?? [];
    const latestMessageSenderId = this.getLatestMessageSenderId();

    return userIds
      .map((userId, index) => ({
        userId,
        name: names[index] ?? '',
        profilePictureUrl: profilePictureUrls[index] ?? 'default-profile.png',
      }))
      .filter((item) =>
        !!item.name.trim()
        && item.userId !== this.group?.currentUserId
        && item.userId !== latestMessageSenderId);
  }

  private getLatestOwnMessageId(): number | null {
    const latestOwnMessage = [...this.messages]
      .reverse()
      .find((message) => this.isOwnMessage(message));

    return latestOwnMessage?.id ?? null;
  }

  private isLatestChatMessage(message: GroupChatMessage): boolean {
    return this.messages[this.messages.length - 1]?.id === message.id;
  }

  private getLatestMessageSenderId(): string | null {
    const latestMessage = this.messages[this.messages.length - 1];

    return latestMessage?.senderUserId ?? null;
  }
}
