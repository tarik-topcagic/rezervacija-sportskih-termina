type ChatContainerTarget = HTMLElement | null | undefined | (() => HTMLElement | null | undefined);
const MAX_SCROLL_RETRIES = 16;
const SCROLL_RETRY_DELAY_MS = 75;

function resolveContainer(target: ChatContainerTarget): HTMLElement | null | undefined {
  return typeof target === 'function' ? target() : target;
}

export function scrollToBottom(target: ChatContainerTarget, behavior: ScrollBehavior = 'auto'): void {
  let isCanceled = false;

  const cancelAutoScroll = (): void => {
    isCanceled = true;
    cleanupListeners();
  };

  const onUserInteraction = (): void => {
    cancelAutoScroll();
  };

  const cleanupListeners = (): void => {
    window.removeEventListener('wheel', onUserInteraction);
    window.removeEventListener('touchstart', onUserInteraction);
    window.removeEventListener('mousedown', onUserInteraction);
    window.removeEventListener('pointerdown', onUserInteraction);
    window.removeEventListener('keydown', onWindowKeyDown);

    const container = resolveContainer(target);
    container?.removeEventListener('wheel', onUserInteraction);
    container?.removeEventListener('touchstart', onUserInteraction);
    container?.removeEventListener('mousedown', onUserInteraction);
    container?.removeEventListener('pointerdown', onUserInteraction);
  };

  const onWindowKeyDown = (event: KeyboardEvent): void => {
    if (['ArrowUp', 'PageUp', 'Home'].includes(event.key)) {
      cancelAutoScroll();
    }
  };

  window.addEventListener('wheel', onUserInteraction, { passive: true });
  window.addEventListener('touchstart', onUserInteraction, { passive: true });
  window.addEventListener('mousedown', onUserInteraction, { passive: true });
  window.addEventListener('pointerdown', onUserInteraction, { passive: true });
  window.addEventListener('keydown', onWindowKeyDown);

  const attemptScroll = (attempt: number): void => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isCanceled) {
            return;
          }

          const container = resolveContainer(target);
          container?.addEventListener('wheel', onUserInteraction, { passive: true });
          container?.addEventListener('touchstart', onUserInteraction, { passive: true });
          container?.addEventListener('mousedown', onUserInteraction, { passive: true });
          container?.addEventListener('pointerdown', onUserInteraction, { passive: true });

          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior,
            });
          }

          window.scrollTo({
            top: Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight,
            ),
            behavior,
          });

          if (attempt < MAX_SCROLL_RETRIES) {
            attemptScroll(attempt + 1);
            return;
          }

          cleanupListeners();
        });
      });
    }, attempt * SCROLL_RETRY_DELAY_MS);
  };

  attemptScroll(0);
}

export function shouldShowScrollButton(target: ChatContainerTarget): boolean {
  const container = resolveContainer(target);
  if (!container) {
    return false;
  }

  const distanceFromBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight;

  return distanceFromBottom > 80;
}
