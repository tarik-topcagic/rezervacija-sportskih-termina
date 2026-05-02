export function clearTypingTimer(
  timer?: ReturnType<typeof setTimeout>,
): ReturnType<typeof setTimeout> | undefined {
  if (timer) {
    clearTimeout(timer);
  }

  return undefined;
}

export function scheduleTypingTimer(
  existingTimer: ReturnType<typeof setTimeout> | undefined,
  callback: () => void,
  delayMs: number,
): ReturnType<typeof setTimeout> {
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  return setTimeout(callback, delayMs);
}
