import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { LanguageService } from '../../services/language.service';
import { PrivateChatService } from '../../services/private-chat.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import {
  appendMessageIfNotExists,
  applyStatusUpdateToMessages,
  mergeStatusUpdates as mergePendingStatusUpdates,
} from '../helpers/chat-status.helper';
import { scrollToBottom, shouldShowScrollButton } from '../helpers/chat-ui.helper';
import { ChatMessageStatusUpdate } from '../interfaces/chat-message-status-update.model';
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
  messages: PrivateMessage[] = [];
  messageText = '';
  isLoading = true;
  isSending = false;
  showScrollToBottomButton = false;
  errorMessage = '';
  private routeSubscription?: Subscription;
  private realtimeMessageSubscription?: Subscription;
  private realtimeStatusSubscription?: Subscription;
  private connectedConversationId: number | null = null;
  private pendingStatusUpdates = new Map<number, ChatMessageStatusUpdate>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatRealtimeService: ChatRealtimeService,
    private privateChatService: PrivateChatService,
    private privateChatNotificationService: PrivateChatNotificationService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    void this.chatRealtimeService.connect();

    this.realtimeMessageSubscription = this.chatRealtimeService.incomingPrivateMessages$.subscribe((message) => {
      this.handleIncomingRealtimeMessage(message);
    });

    this.realtimeStatusSubscription = this.chatRealtimeService.incomingMessageStatusUpdates$.subscribe((update) => {
      this.handleStatusUpdate(update);
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
    this.routeSubscription?.unsubscribe();
    this.realtimeMessageSubscription?.unsubscribe();
    this.realtimeStatusSubscription?.unsubscribe();
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

  private loadChat(conversationId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.privateChatService.getConversations().subscribe({
      next: (conversations) => {
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
    this.conversation = null;
    this.messages = [];
    this.messageText = '';
    this.isLoading = true;
    this.isSending = false;
    this.showScrollToBottomButton = false;
    this.errorMessage = '';
    this.pendingStatusUpdates.clear();
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
}
