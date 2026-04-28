import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupService } from '../../services/group.service';
import { GroupChatNotificationService } from '../../services/group-chat-notification.service';
import { LanguageService } from '../../services/language.service';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private groupChatNotificationService: GroupChatNotificationService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const groupId = Number(params.get('id'));

      if (!groupId) {
        this.router.navigate(['/grupe']);
        return;
      }

      this.resetViewState();
      this.loadChat(groupId);
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
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
        this.messages = [...this.messages, message];
        this.messageText = '';
        this.isSending = false;
        this.scrollToBottom('smooth');
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
    this.updateScrollButtonVisibility();
  }

  scrollMessagesToLatest(): void {
    this.scrollToBottom('smooth');
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
        this.scrollToBottom();
        this.markCurrentGroupChatAsRead(groupId);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.languageService.translate('groupChatLoadError');
        console.error('Error loading group chat messages:', error);
      },
    });
  }

  private scrollToBottom(behavior: ScrollBehavior = 'auto'): void {
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const container = this.messagesContainer?.nativeElement;
          if (!container) {
            return;
          }

          container.scrollTo({
            top: container.scrollHeight,
            behavior,
          });

          window.scrollTo({
            top: document.body.scrollHeight,
            behavior,
          });

          this.updateScrollButtonVisibility();
        });
      });
    }, 0);
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

  private updateScrollButtonVisibility(): void {
    const container = this.messagesContainer?.nativeElement;
    if (!container) {
      this.showScrollToBottomButton = false;
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    this.showScrollToBottomButton = distanceFromBottom > 80;
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
}
