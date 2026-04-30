import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { GroupService } from '../../services/group.service';
import { LanguageService } from '../../services/language.service';
import { scrollToBottom, shouldShowScrollButton } from '../helpers/chat-ui.helper';
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
  private connectedGroupId: number | null = null;

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

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const groupId = Number(params.get('id'));

      if (!groupId) {
        this.router.navigate(['/grupe']);
        return;
      }

      this.resetViewState();
      this.loadChat(groupId);
      void this.setupRealtime(groupId);
    });
  }

  ngAfterViewInit(): void {
    this.scrollMessagesToBottom();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.realtimeMessageSubscription?.unsubscribe();
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
        if (!this.appendMessageIfNotExists(message)) {
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
  }

  private async setupRealtime(groupId: number): Promise<void> {
    if (this.connectedGroupId !== null && this.connectedGroupId !== groupId) {
      await this.chatRealtimeService.leaveGroup(this.connectedGroupId);
    }

    this.connectedGroupId = groupId;
    await this.chatRealtimeService.joinGroup(groupId);
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

    if (!this.appendMessageIfNotExists(message)) {
      return;
    }

    this.scrollMessagesToBottom('smooth');
    this.markCurrentGroupChatAsRead(message.groupId);
  }

  private appendMessageIfNotExists(message: GroupChatMessage): boolean {
    if (this.messages.some((existingMessage) => existingMessage.id === message.id)) {
      return false;
    }

    this.messages = [...this.messages, message];
    return true;
  }
}
