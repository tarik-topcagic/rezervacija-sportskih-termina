export function isDropdownActiveForViewport(
  mode: 'desktop' | 'mobile',
  mediaQuery: MediaQueryList,
): boolean {
  return mode === 'desktop'
    ? mediaQuery.matches
    : !mediaQuery.matches;
}

export function startDropdownTimer(
  callback: () => void,
  intervalMs: number,
): ReturnType<typeof setInterval> {
  return setInterval(callback, intervalMs);
}

export function clearDropdownTimer(
  timer?: ReturnType<typeof setInterval>,
): ReturnType<typeof setInterval> | undefined {
  if (timer) {
    clearInterval(timer);
  }

  return undefined;
}

export function createHighlightedSet<T, TKey>(
  items: T[],
  predicate: (item: T) => boolean,
  keySelector: (item: T) => TKey,
): Set<TKey> {
  return new Set(
    items
      .filter(predicate)
      .map(keySelector),
  );
}

export function prependIfNotExists<T>(
  items: T[],
  newItem: T,
  exists: (item: T) => boolean,
): T[] {
  return items.some(exists)
    ? items
    : [newItem, ...items];
}

export function moveItemToTop<T>(
  items: T[],
  updatedItem: T,
  match: (item: T) => boolean,
): T[] {
  return [
    updatedItem,
    ...items.filter((item) => !match(item)),
  ];
}

export function incrementIf(
  currentValue: number,
  shouldIncrement: boolean,
): number {
  return shouldIncrement
    ? currentValue + 1
    : currentValue;
}
