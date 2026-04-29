import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { PrivateChatService } from '../../services/private-chat.service';
import { PrivateChatNotificationService } from '../../services/private-chat-notification.service';
import { scrollToBottom, shouldShowScrollButton } from '../helpers/chat-ui.helper';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private privateChatService: PrivateChatService,
    private privateChatNotificationService: PrivateChatNotificationService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const conversationId = Number(params.get('conversationId'));

      if (!conversationId) {
        this.router.navigate(['/poruke']);
        return;
      }

      this.resetViewState();
      this.loadChat(conversationId);
    });
  }

  ngAfterViewInit(): void {
    this.scrollMessagesToBottom();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
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
        this.messages = [...this.messages, message];
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

  private scrollMessagesToBottom(behavior: ScrollBehavior = 'auto'): void {
    scrollToBottom(() => this.messagesContainer?.nativeElement, behavior);
    this.syncScrollButtonVisibility();
  }

  private syncScrollButtonVisibility(): void {
    this.showScrollToBottomButton = shouldShowScrollButton(() => this.messagesContainer?.nativeElement);
  }
}
