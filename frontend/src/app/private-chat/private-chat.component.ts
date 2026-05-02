import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { ChatInboxService } from '../../services/chat-inbox.service';
import { LanguageService } from '../../services/language.service';
import { PrivateChatService } from '../../services/private-chat.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import {
  appendMessageIfNotExists,
  applyStatusUpdateToMessages,
  mergeStatusUpdates as mergePendingStatusUpdates,
} from '../helpers/chat-status.helper';
import {
  applyRealtimeChatListNotification as applyRealtimeChatListUpdate,
  createChatListHighlightedKeys,
  createGroupChatListItemFromNotification,
  createPrivateChatListItemFromNotification,
  getChatListItemKey,
} from '../helpers/chat-list.helper';
import { clearTypingTimer, scheduleTypingTimer } from '../helpers/chat-typing.helper';
import { scrollToBottom, shouldShowScrollButton } from '../helpers/chat-ui.helper';
import { getUserIdFromToken } from '../helpers/jwt.helper';
import { ChatInboxItem } from '../interfaces/chat-inbox-item.model';
import { ChatMessageNotification } from '../interfaces/chat-message-notification.model';
import { ChatMessageStatusUpdate } from '../interfaces/chat-message-status-update.model';
import { ChatTypingEvent } from '../interfaces/chat-typing-event.model';
import { PrivateConversation, PrivateMessage } from '../interfaces/private-chat.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-private-chat',
  imports: [DatePipe, NgIf, NgFor, NgClass, FormsModule, RouterLink, NavbarComponent, TranslatePipe],
  templateUrl: './private-chat.component.html',
  styleUrl: './private-chat.component.scss',
})
export class PrivateChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLDivElement>;

  conversation: PrivateConversation | null = null;
  conversations: PrivateConversation[] = [];
  chatListItems: ChatInboxItem[] = [];
  highlightedChatListKeys = new Set<string>();
  messages: PrivateMessage[] = [];
  messageText = '';
  isLoading = true;
  isSending = false;
  showScrollToBottomButton = false;
  errorMessage = '';
  private currentUserId: string | null = null;
  private currentUserSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private realtimeMessageSubscription?: Subscription;
  private realtimeNotificationSubscription?: Subscription;
  private realtimeStatusSubscription?: Subscription;
  private realtimeTypingSubscription?: Subscription;
  private realtimeStopTypingSubscription?: Subscription;
  private connectedConversationId: number | null = null;
  private pendingStatusUpdates = new Map<number, ChatMessageStatusUpdate>();
  private readonly typingUsers = new Map<string, string>();
  private typingStartTimeoutId?: ReturnType<typeof setTimeout>;
  private typingStopTimeoutId?: ReturnType<typeof setTimeout>;
  private isTypingActive = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private chatRealtimeService: ChatRealtimeService,
    private chatInboxService: ChatInboxService,
    private privateChatService: PrivateChatService,
    private privateChatNotificationService: PrivateChatNotificationService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    void this.chatRealtimeService.connect();

    this.currentUserSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUserId = user?.token ? getUserIdFromToken(user.token) : null;
    });

    this.realtimeMessageSubscription = this.chatRealtimeService.incomingPrivateMessages$.subscribe((message) => {
      this.handleIncomingRealtimeMessage(message);
    });

    this.realtimeNotificationSubscription = this.chatRealtimeService.incomingMessageNotifications$.subscribe((notification) => {
      this.applyRealtimeChatListNotification(notification);
    });

    this.realtimeStatusSubscription = this.chatRealtimeService.incomingMessageStatusUpdates$.subscribe((update) => {
      this.handleStatusUpdate(update);
    });

    this.realtimeTypingSubscription = this.chatRealtimeService.incomingTyping$.subscribe((event) => {
      this.handleTypingEvent(event);
    });

    this.realtimeStopTypingSubscription = this.chatRealtimeService.incomingStopTyping$.subscribe((event) => {
      this.handleStopTypingEvent(event);
    });

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const conversationId = Number(params.get('conversationId'));

      if (!conversationId) {
        this.router.navigate(['/poruke']);
        return;
      }

      this.resetViewState();
      void this.initializeConversation(conversationId);
    });
  }

  ngAfterViewInit(): void {
    this.scrollMessagesToBottom();
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.realtimeMessageSubscription?.unsubscribe();
    this.realtimeNotificationSubscription?.unsubscribe();
    this.realtimeStatusSubscription?.unsubscribe();
    this.realtimeTypingSubscription?.unsubscribe();
    this.realtimeStopTypingSubscription?.unsubscribe();
    this.stopTypingLocally();
    if (this.connectedConversationId !== null) {
      void this.chatRealtimeService.leaveConversation(this.connectedConversationId);
    }
    void this.chatRealtimeService.disconnect();
  }

  sendMessage(): void {
    const trimmedMessage = this.messageText.trim();
    if (!this.conversation?.id || !trimmedMessage || this.isSending) {
      return;
    }

    this.stopTypingLocally();
    this.isSending = true;
    this.errorMessage = '';

    this.privateChatService.sendMessageToConversation(this.conversation.id, trimmedMessage).subscribe({
      next: (message) => {
        const appendResult = appendMessageIfNotExists(
          this.messages,
          message,
          this.pendingStatusUpdates,
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
        this.errorMessage = this.languageService.translate('privateChatSendError');
        console.error('Error sending private chat message:', error);
      },
    });
  }

  isOwnMessage(message: PrivateMessage): boolean {
    return message.senderUserId !== this.conversation?.otherUserId;
  }

  canSendMessage(): boolean {
    return !!this.conversation?.id && !!this.messageText.trim() && !this.isSending;
  }

  onMessageInputChange(): void {
    if (!this.conversation?.id) {
      return;
    }

    if (!this.messageText.trim()) {
      this.stopTypingLocally();
      return;
    }

    if (!this.isTypingActive && !this.typingStartTimeoutId) {
      this.typingStartTimeoutId = setTimeout(() => {
        this.typingStartTimeoutId = undefined;

        if (!this.conversation?.id || !this.messageText.trim() || this.isTypingActive) {
          return;
        }

        this.isTypingActive = true;
        void this.chatRealtimeService.startTyping('private', this.conversation.id);
      }, 300);
    }

    this.scheduleTypingStop();
  }

  onMessagesScroll(): void {
    this.syncScrollButtonVisibility();
  }

  scrollMessagesToLatest(): void {
    this.scrollMessagesToBottom('smooth');
  }

  shouldShowOwnMessageStatus(message: PrivateMessage): boolean {
    return this.isOwnMessage(message) && this.getLatestOwnMessageId() === message.id;
  }

  getMessageStatusLabel(message: PrivateMessage): string {
    if (message.seenAt) {
      return this.languageService.translate('seen');
    }

    if (message.deliveredAt) {
      return this.languageService.translate('delivered');
    }

    return this.languageService.translate('sent');
  }

  hasTypingUsers(): boolean {
    return this.typingUsers.size > 0;
  }

  getTypingIndicatorAvatarUrl(): string | null {
    return this.conversation?.otherProfilePictureUrl ?? null;
  }

  getTypingIndicatorAvatarAlt(): string {
    return this.conversation?.otherFullName ?? this.languageService.translate('messages');
  }

  openConversation(conversationId: number): void {
    if (this.conversation?.id === conversationId) {
      return;
    }

    this.router.navigate(['/poruke/privatno', conversationId]);
  }

  openChatListItem(item: ChatInboxItem): void {
    if (item.type === 'private' && item.conversationId) {
      void this.router.navigate(['/poruke/privatno', item.conversationId]);
      return;
    }

    if (item.type === 'group' && item.groupId) {
      void this.router.navigate(['/grupe', item.groupId, 'chat']);
    }
  }

  isActiveChatListItem(item: ChatInboxItem): boolean {
    return item.type === 'private' && item.conversationId === this.conversation?.id;
  }

  isHighlightedChatListItem(item: ChatInboxItem): boolean {
    return this.highlightedChatListKeys.has(getChatListItemKey(item));
  }

  private loadChat(conversationId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadChatListItems();

    this.privateChatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        const conversation = conversations.find((item) => item.id === conversationId);

        if (!conversation) {
          this.router.navigate(['/poruke']);
          return;
        }

        this.conversation = conversation;
        this.loadMessages(conversationId);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.languageService.translate('privateChatLoadError');
        console.error('Error loading private chat conversation:', error);
      },
    });
  }

  private loadMessages(conversationId: number): void {
    this.privateChatService.getMessages(conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoading = false;
        this.markConversationAsRead(conversationId);
        this.scrollMessagesToBottom();
        this.acknowledgeLoadedMessages();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.languageService.translate('privateChatLoadError');
        console.error('Error loading private chat messages:', error);
      },
    });
  }

  private resetViewState(): void {
    this.stopTypingLocally();
    this.conversation = null;
    this.messages = [];
    this.messageText = '';
    this.isLoading = true;
    this.isSending = false;
    this.showScrollToBottomButton = false;
    this.errorMessage = '';
    this.highlightedChatListKeys.clear();
    this.pendingStatusUpdates.clear();
    this.typingUsers.clear();
  }

  private loadChatListItems(): void {
    this.chatInboxService.getInboxItems().subscribe({
      next: (items) => {
        this.chatListItems = items;
        this.highlightedChatListKeys = createChatListHighlightedKeys(items);
      },
      error: (error) => {
        console.error('Error loading desktop chat list items:', error);
      },
    });
  }

  private markConversationAsRead(conversationId: number): void {
    this.privateChatNotificationService.markConversationAsRead(conversationId).subscribe({
      next: () => {
        this.privateChatNotificationService.notifyUnreadCountChanged();
      },
      error: (error) => {
        console.error('Error marking private conversation as read:', error);
      },
    });
  }

  private async setupRealtime(conversationId: number): Promise<void> {
    if (this.connectedConversationId !== null && this.connectedConversationId !== conversationId) {
      await this.chatRealtimeService.leaveConversation(this.connectedConversationId);
    }

    this.connectedConversationId = conversationId;
    await this.chatRealtimeService.joinConversation(conversationId);
  }

  private async initializeConversation(conversationId: number): Promise<void> {
    await this.setupRealtime(conversationId);
    this.loadChat(conversationId);
  }

  private handleIncomingRealtimeMessage(message: PrivateMessage): void {
    if (!this.conversation?.id || message.conversationId !== this.conversation.id) {
      return;
    }

    const appendResult = appendMessageIfNotExists(
      this.messages,
      message,
      this.pendingStatusUpdates,
    );
    this.messages = appendResult.messages;

    if (!appendResult.appended) {
      return;
    }

    this.scrollMessagesToBottom('smooth');
    this.markConversationAsRead(message.conversationId);
    this.acknowledgeIncomingMessage(message);
    this.typingUsers.delete(message.senderUserId);
  }

  private handleStatusUpdate(update: ChatMessageStatusUpdate): void {
    if (update.chatType !== 'private'
      || !this.conversation?.id
      || update.conversationId !== this.conversation.id) {
      return;
    }

    const updateResult = applyStatusUpdateToMessages(
      this.messages,
      update,
    );
    this.messages = updateResult.messages;

    if (!updateResult.didUpdateExistingMessage) {
      this.pendingStatusUpdates.set(update.messageId, this.mergeStatusUpdates(
        this.pendingStatusUpdates.get(update.messageId),
        update,
      ));
    }
  }

  private acknowledgeIncomingMessage(message: PrivateMessage): void {
    if (!this.conversation?.id || this.isOwnMessage(message)) {
      return;
    }

    void this.chatRealtimeService.acknowledgePrivateMessageDelivered(this.conversation.id, message.id);
    void this.chatRealtimeService.acknowledgePrivateMessageSeen(this.conversation.id, message.id);
  }

  private acknowledgeLoadedMessages(): void {
    if (!this.conversation?.id) {
      return;
    }

    const latestIncomingMessageId = [...this.messages]
      .reverse()
      .find((message) => !this.isOwnMessage(message))?.id;

    for (const message of this.messages) {
      if (this.isOwnMessage(message)) {
        continue;
      }

      void this.chatRealtimeService.acknowledgePrivateMessageDelivered(this.conversation.id, message.id);

      if (latestIncomingMessageId === message.id) {
        void this.chatRealtimeService.acknowledgePrivateMessageSeen(this.conversation.id, message.id);
      }
    }
  }

  private mergeStatusUpdates(
    currentUpdate: ChatMessageStatusUpdate | undefined,
    nextUpdate: ChatMessageStatusUpdate,
  ): ChatMessageStatusUpdate {
    return mergePendingStatusUpdates(currentUpdate, nextUpdate);
  }

  private handleTypingEvent(event: ChatTypingEvent): void {
    if (event.type !== 'private'
      || !this.conversation?.id
      || event.targetId !== this.conversation.id.toString()
      || event.userId !== this.conversation.otherUserId) {
      return;
    }

    const shouldStickToBottom = !this.showScrollToBottomButton;
    this.typingUsers.set(event.userId, event.userName);
    this.adjustScrollAfterTypingStateChange(shouldStickToBottom);
  }

  private handleStopTypingEvent(event: ChatTypingEvent): void {
    if (event.type !== 'private'
      || !this.conversation?.id
      || event.targetId !== this.conversation.id.toString()) {
      return;
    }

    const shouldStickToBottom = !this.showScrollToBottomButton;
    this.typingUsers.delete(event.userId);
    this.adjustScrollAfterTypingStateChange(shouldStickToBottom);
  }

  private scheduleTypingStop(): void {
    this.typingStopTimeoutId = scheduleTypingTimer(this.typingStopTimeoutId, () => {
      this.typingStopTimeoutId = undefined;
      this.stopTypingLocally();
    }, 1500);
  }

  private stopTypingLocally(): void {
    this.typingStartTimeoutId = clearTypingTimer(this.typingStartTimeoutId);
    this.typingStopTimeoutId = clearTypingTimer(this.typingStopTimeoutId);

    if (!this.conversation?.id || !this.isTypingActive) {
      this.isTypingActive = false;
      return;
    }

    this.isTypingActive = false;
    void this.chatRealtimeService.stopTyping('private', this.conversation.id);
  }

  private adjustScrollAfterTypingStateChange(shouldStickToBottom: boolean): void {
    if (!shouldStickToBottom) {
      this.syncScrollButtonVisibility();
      return;
    }

    this.scrollMessagesToBottom();
  }

  private getLatestOwnMessageId(): number | null {
    const latestOwnMessage = [...this.messages]
      .reverse()
      .find((message) => this.isOwnMessage(message));

    return latestOwnMessage?.id ?? null;
  }

  private scrollMessagesToBottom(behavior: ScrollBehavior = 'auto'): void {
    scrollToBottom(() => this.messagesContainer?.nativeElement, behavior);
    this.syncScrollButtonVisibility();
  }

  private syncScrollButtonVisibility(): void {
    this.showScrollToBottomButton = shouldShowScrollButton(() => this.messagesContainer?.nativeElement);
  }

  private applyRealtimeChatListNotification(notification: ChatMessageNotification): void {
    const updateResult = applyRealtimeChatListUpdate({
      items: this.chatListItems,
      highlightedKeys: this.highlightedChatListKeys,
      notification,
      currentUserId: this.currentUserId,
      isCurrentOpenChat: notification.type === 'private' && notification.conversationId === this.conversation?.id,
      createItem: (incomingNotification, shouldHighlight) =>
        incomingNotification.type === 'private'
          ? createPrivateChatListItemFromNotification(incomingNotification, shouldHighlight, this.conversation)
          : createGroupChatListItemFromNotification(incomingNotification, shouldHighlight, null),
    });

    this.chatListItems = updateResult.items;
    this.highlightedChatListKeys = updateResult.highlightedKeys;
  }
}
