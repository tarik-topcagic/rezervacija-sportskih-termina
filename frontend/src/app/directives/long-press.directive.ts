import { Directive, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';

type GestureState = 'pending' | 'swiping' | 'scrolling';

@Directive({
  selector: '[appLongPress]',
  standalone: true,
})
export class LongPressDirective implements OnDestroy {
  @Input() longPressDisabled = false;
  @Output() longPress = new EventEmitter<void>();
  @Output() doubleTap = new EventEmitter<void>();
  // Live signed horizontal offset (px) while a horizontal drag is in progress --
  // negative while dragging left, positive while dragging right.
  @Output() swipeProgress = new EventEmitter<number>();
  // Fires once, on release, only if the drag crossed swipeCompletionThresholdPx.
  @Output() swipeCompleted = new EventEmitter<'left' | 'right'>();
  // Fires once, on release, if a drag was started but never crossed the threshold
  // (or was interrupted) -- consumer should animate the bubble back to rest.
  @Output() swipeCancelled = new EventEmitter<void>();

  private readonly pressDurationMs = 500;
  // Dead zone before any gesture (long-press, swipe, or scroll) is classified. Reused
  // for swipe/scroll classification, not just long-press cancellation, so a single
  // consistent threshold decides "was this movement enough to mean anything" everywhere.
  private readonly moveCancelThresholdPx = 10;
  private readonly doubleTapThresholdMs = 300;
  private readonly maxSwipeDistancePx = 90;
  private readonly swipeCompletionThresholdPx = 60;

  private timeoutId?: ReturnType<typeof setTimeout>;
  private startX = 0;
  private startY = 0;
  private longPressFired = false;
  private lastTapTime = 0;
  // Undecided until the first touchmove exceeds the dead zone in one axis or the
  // other; 'scrolling' means "let the browser handle it, we're staying out of the way".
  private gestureState: GestureState = 'pending';
  private lastDeltaX = 0;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.longPressDisabled || event.touches.length !== 1) {
      return;
    }

    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.longPressFired = false;
    this.gestureState = 'pending';
    this.lastDeltaX = 0;

    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined;
      this.longPressFired = true;
      this.longPress.emit();
    }, this.pressDurationMs);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.longPressDisabled || event.touches.length !== 1 || this.longPressFired) {
      return;
    }

    const deltaX = event.touches[0].clientX - this.startX;
    const deltaY = event.touches[0].clientY - this.startY;

    if (this.gestureState === 'pending') {
      if (Math.abs(deltaX) <= this.moveCancelThresholdPx && Math.abs(deltaY) <= this.moveCancelThresholdPx) {
        // Still within the dead zone -- not yet enough movement to mean anything.
        // Long-press timer keeps running untouched.
        return;
      }

      // Movement exceeded the dead zone: this is no longer a stationary press,
      // regardless of which way it goes next. A plain "deltaX > deltaY" here
      // misclassifies a lot of genuine vertical scroll attempts as swipes: natural
      // hand tremor means the very first movement that clears the dead zone is often
      // only marginally more horizontal than vertical (e.g. deltaX=11, deltaY=9) even
      // when the user's actual intent is to scroll. Requiring horizontal movement to
      // clearly dominate, not just barely exceed, keeps borderline/ambiguous drags
      // classified as scroll -- the safer default, and also directly reduces how often
      // preventDefault() below gets called on what the browser (independently) has
      // already begun treating as an in-progress, non-cancelable scroll.
      this.clearTimer();

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        this.gestureState = 'swiping';
      } else {
        // Vertical-dominant (or too ambiguous to call horizontal): this is a scroll,
        // not a swipe. Deliberately do NOT call preventDefault() here or below --
        // native scrolling proceeds exactly as it would without this directive
        // existing at all.
        this.gestureState = 'scrolling';
        return;
      }
    }

    if (this.gestureState === 'swiping') {
      // Stop the browser from also trying to scroll/pan while we're driving the
      // horizontal drag ourselves. event.cancelable can still be false here even for a
      // gesture this code correctly classified as a swipe -- the browser makes its own,
      // independent, earlier determination of whether a touch sequence is scrollable,
      // and once it has locked a sequence into an active scroll, every further
      // touchmove in that sequence becomes non-cancelable. Calling preventDefault() on
      // one of those is a silent no-op that Chrome also logs as an "Intervention"
      // warning; checking cancelable first avoids the call (and the warning) entirely
      // rather than relying on classification alone to prevent it.
      if (event.cancelable) {
        event.preventDefault();
      }

      this.lastDeltaX = Math.max(-this.maxSwipeDistancePx, Math.min(this.maxSwipeDistancePx, deltaX));
      this.swipeProgress.emit(this.lastDeltaX);
    }
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    const wasPendingTap = !this.longPressFired && !!this.timeoutId && this.gestureState === 'pending';
    const finishedGestureState = this.gestureState;

    this.clearTimer();
    this.gestureState = 'pending';

    if (finishedGestureState === 'swiping') {
      if (Math.abs(this.lastDeltaX) >= this.swipeCompletionThresholdPx) {
        this.swipeCompleted.emit(this.lastDeltaX < 0 ? 'left' : 'right');
      } else {
        this.swipeCancelled.emit();
      }
      return;
    }

    if (this.longPressDisabled || !wasPendingTap) {
      return;
    }

    const now = Date.now();
    if (now - this.lastTapTime <= this.doubleTapThresholdMs) {
      this.lastTapTime = 0;
      this.doubleTap.emit();
    } else {
      this.lastTapTime = now;
    }
  }

  @HostListener('touchcancel')
  onTouchCancel(): void {
    this.clearTimer();

    if (this.gestureState === 'swiping') {
      this.swipeCancelled.emit();
    }

    this.gestureState = 'pending';
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
