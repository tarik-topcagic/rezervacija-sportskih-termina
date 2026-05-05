export type SearchSortDirection = 'asc' | 'desc';

export function normalizeSearchText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function matchesSearchQuery(
  values: Array<string | null | undefined>,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => normalizeSearchText(value).includes(normalizedQuery));
}

export function sortItemsByText<T>(
  items: T[],
  selector: (item: T) => string | null | undefined,
  direction: SearchSortDirection = 'asc',
): T[] {
  const sortedItems = [...items].sort((first, second) =>
    normalizeSearchText(selector(first)).localeCompare(normalizeSearchText(selector(second))),
  );

  return direction === 'desc'
    ? sortedItems.reverse()
    : sortedItems;
}
