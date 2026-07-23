import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { CHAT_EMOJI_OPTIONS, MESSAGE_QUICK_REACTIONS } from '../helpers/chat-input.helper';
import { TranslatePipe } from '../pipes/translate.pipe';
import { MessageActionsCoordinatorService } from '../../services/message-actions-coordinator.service';

type MessageActionsPopup = 'none' | 'more' | 'quick-reaction' | 'wide-picker' | 'mobile-combo';

@Component({
  selector: 'app-message-actions',
  imports: [NgIf, NgFor, NgClass, NgTemplateOutlet, TranslatePipe],
  templateUrl: './message-actions.component.html',
  styleUrl: './message-actions.component.scss',
})
export class MessageActionsComponent implements OnDestroy {
  @Input() @HostBinding('class.own-message-actions') isOwnMessage = false;
  @Input() isPinned = false;
  @Input() currentUserReactionEmoji: string | null = null;
  @Input() disabled = false;

  @HostBinding('class.actions-open')
  get isOpen(): boolean {
    return this.activePopup !== 'none';
  }

  @Output() copyRequested = new EventEmitter<void>();
  @Output() pinRequested = new EventEmitter<void>();
  @Output() unsendRequested = new EventEmitter<void>();
  @Output() replyRequested = new EventEmitter<void>();
  @Output() reactionSelected = new EventEmitter<string>();

  @ViewChild('moreMenuPopup') private moreMenuPopupTemplate!: TemplateRef<unknown>;
  @ViewChild('quickReactionPopup') private quickReactionPopupTemplate!: TemplateRef<unknown>;
  @ViewChild('mobileComboPopup') private mobileComboPopupTemplate!: TemplateRef<unknown>;
  @ViewChild('widePickerPopup') private widePickerPopupTemplate!: TemplateRef<unknown>;

  @ViewChild('moreTriggerBtn') private moreTriggerBtnRef?: ElementRef<HTMLElement>;
  @ViewChild('reactionTriggerBtn') private reactionTriggerBtnRef?: ElementRef<HTMLElement>;

  readonly quickReactions = MESSAGE_QUICK_REACTIONS;
  readonly allEmojis = CHAT_EMOJI_OPTIONS;
  activePopup: MessageActionsPopup = 'none';

  private overlayRef: OverlayRef | null = null;
  private readonly coordinatorSubscription: Subscription;
  private mobileRestabilizeSubscription: Subscription | null = null;
  // Only ever populated for a desktop popup while it's open (see openPopup/
  // disposeOverlay). Not used on mobile -- positionMobilePopupDirectly() already
  // reruns on every zone-stable event, which covers viewport/orientation changes too.
  private windowResizeListener: (() => void) | null = null;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private coordinator: MessageActionsCoordinatorService,
    private ngZone: NgZone,
  ) {
    this.coordinatorSubscription = this.coordinator.activeChanged$.subscribe((activeInstance) => {
      if (activeInstance !== this && this.activePopup !== 'none') {
        this.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.coordinatorSubscription.unsubscribe();
    this.coordinator.clearActive(this);
    this.disposeOverlay();
  }

  @HostListener('mouseenter')
  onHostMouseEnter(): void {
    if (this.disabled) {
      return;
    }

    this.coordinator.setActive(this);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.activePopup !== 'none') {
      this.close();
    }
  }

  triggerMobileCombo(): void {
    if (this.disabled) {
      return;
    }

    if (this.activePopup === 'mobile-combo') {
      this.close();
      return;
    }

    this.openPopup('mobile-combo', this.mobileComboPopupTemplate);
  }

  toggleMore(event: Event): void {
    event.stopPropagation();

    if (this.activePopup === 'more') {
      this.close();
      return;
    }

    this.openPopup('more', this.moreMenuPopupTemplate);
  }

  toggleQuickReaction(event: Event): void {
    event.stopPropagation();

    if (this.activePopup === 'quick-reaction') {
      this.close();
      return;
    }

    this.openPopup('quick-reaction', this.quickReactionPopupTemplate);
  }

  openWidePicker(event: Event): void {
    event.stopPropagation();
    this.openPopup('wide-picker', this.widePickerPopupTemplate);
  }

  requestReply(event: Event): void {
    event.stopPropagation();
    this.close();
    this.replyRequested.emit();
  }

  requestCopy(event: Event): void {
    event.stopPropagation();
    this.close();
    this.copyRequested.emit();
  }

  requestPin(event: Event): void {
    event.stopPropagation();
    this.close();
    this.pinRequested.emit();
  }

  requestUnsend(event: Event): void {
    event.stopPropagation();
    this.close();
    this.unsendRequested.emit();
  }

  selectReaction(emoji: string, event: Event): void {
    event.stopPropagation();
    this.close();
    this.reactionSelected.emit(emoji);
  }

  close(): void {
    this.activePopup = 'none';
    this.disposeOverlay();
    this.coordinator.clearActive(this);
  }

  private openPopup(popup: MessageActionsPopup, template: TemplateRef<unknown>): void {
    this.disposeOverlay();
    this.coordinator.setActive(this);
    this.activePopup = popup;

    // Matches the exact breakpoint the mobile media query in this component's own
    // .scss uses (see "@media (max-width: 767.98px)"), so JS and CSS can never
    // disagree about what counts as mobile.
    const isMobile = window.matchMedia('(max-width: 767.98px)').matches;

    const positionStrategy = isMobile
      ? this.overlay.position().global()
      : this.overlay.position()
          .flexibleConnectedTo(this.getPositionOrigin(popup))
          .withPositions(this.getPreferredPositions())
          .withPush(true)
          .withViewportMargin(8);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    this.overlayRef.attach(new TemplatePortal(template, this.viewContainerRef));

    this.overlayRef.backdropClick().subscribe(() => this.close());

    requestAnimationFrame(() => {
      if (isMobile) {
        this.positionMobilePopupDirectly();
      } else {
        this.overlayRef?.updatePosition();
        this.clampToMessagesPanel();
      }
    });

    if (isMobile) {
      this.mobileRestabilizeSubscription = this.ngZone.onStable.subscribe(() => {
        this.positionMobilePopupDirectly();
      });
    } else {
      // A resized window leaves the popup at a now-stale, likely-wrong position
      // (computed against the old viewport/panel dimensions) rather than adjusting to
      // fit -- simplest correct behavior is to just close it, matching how it already
      // closes on scroll (scrollStrategies.close()) rather than trying to reposition.
      this.windowResizeListener = () => this.close();
      window.addEventListener('resize', this.windowResizeListener);
    }

    this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;

      if (target && this.elementRef.nativeElement.contains(target)) {
        return;
      }

      this.close();
    });
  }

  private disposeOverlay(): void {
    if (this.mobileRestabilizeSubscription) {
      this.mobileRestabilizeSubscription.unsubscribe();
      this.mobileRestabilizeSubscription = null;
    }

    if (this.windowResizeListener) {
      window.removeEventListener('resize', this.windowResizeListener);
      this.windowResizeListener = null;
    }

    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private getPositionOrigin(popup: MessageActionsPopup): HTMLElement {
    if (popup === 'more') {
      return this.moreTriggerBtnRef?.nativeElement ?? this.elementRef.nativeElement;
    }

    return this.reactionTriggerBtnRef?.nativeElement ?? this.elementRef.nativeElement;
  }

  private getPreferredPositions(): ConnectedPosition[] {
    const gap = 8;

    return this.isOwnMessage
      ? [
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -gap },
          { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -gap },
        ]
      : [
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: gap },
          { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: gap },
        ];
  }

  private clampToMessagesPanel(): void {
    if (!this.overlayRef) {
      return;
    }

    const panelEl = this.elementRef.nativeElement.closest('.messages-panel') as HTMLElement | null;
    const paneEl = this.overlayRef.overlayElement;

    if (!panelEl) {
      return;
    }

    const panelRect = panelEl.getBoundingClientRect();
    const paneRect = paneEl.getBoundingClientRect();
    const margin = 8;

    let deltaX = 0;
    let deltaY = 0;

    if (paneRect.left < panelRect.left + margin) {
      deltaX = (panelRect.left + margin) - paneRect.left;
    } else if (paneRect.right > panelRect.right - margin) {
      deltaX = (panelRect.right - margin) - paneRect.right;
    }

    if (paneRect.top < panelRect.top + margin) {
      deltaY = (panelRect.top + margin) - paneRect.top;
    } else if (paneRect.bottom > panelRect.bottom - margin) {
      deltaY = (panelRect.bottom - margin) - paneRect.bottom;
    }

    paneEl.style.transform = (deltaX || deltaY) ? `translate(${deltaX}px, ${deltaY}px)` : '';
  }

  private positionMobilePopupDirectly(): void {
    if (!this.overlayRef) {
      return;
    }

    const bubbleEl = this.elementRef.nativeElement.closest('.message-bubble') as HTMLElement | null;
    const panelEl = this.elementRef.nativeElement.closest('.messages-panel') as HTMLElement | null;
    const paneEl = this.overlayRef.overlayElement;

    if (!bubbleEl || !panelEl) {
      return;
    }

    paneEl.style.position = 'fixed';
    paneEl.style.margin = '0';
    paneEl.style.transform = 'none';
    paneEl.style.top = '0px';
    paneEl.style.left = '0px';

    const bubbleRect = bubbleEl.getBoundingClientRect();
    const panelRect = panelEl.getBoundingClientRect();
    const paneRect = paneEl.getBoundingClientRect();
    const margin = 8;
    const gap = 4;

    const roomAbove = bubbleRect.top - (panelRect.top + margin);
    const roomBelow = (panelRect.bottom - margin) - bubbleRect.bottom;
    const popupHeight = paneRect.height;
    const popupWidth = paneRect.width;

    let top: number;

    if (popupHeight + gap <= roomAbove) {
      top = bubbleRect.top - gap - popupHeight;
    } else if (popupHeight + gap <= roomBelow) {
      top = bubbleRect.bottom + gap;
    } else if (roomAbove >= roomBelow) {
      top = Math.max(panelRect.top + margin, bubbleRect.top - gap - popupHeight);
    } else {
      top = Math.min(panelRect.bottom - margin - popupHeight, bubbleRect.bottom + gap);
    }

    const centeredLeft = bubbleRect.left + (bubbleRect.width - popupWidth) / 2;
    const left = Math.max(
      panelRect.left + margin,
      Math.min(centeredLeft, panelRect.right - margin - popupWidth),
    );

    paneEl.style.top = `${top}px`;
    paneEl.style.left = `${left}px`;
  }
}
