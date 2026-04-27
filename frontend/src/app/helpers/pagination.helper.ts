export interface PaginationResult<T> {
  pagedItems: T[];
  totalPages: number;
  totalPagesArray: number[];
}

export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
): PaginationResult<T> {
  const safePageSize = pageSize > 0 ? pageSize : 1;
  const totalPages = Math.ceil(items.length / safePageSize);
  const normalizedPage = totalPages > 0
    ? Math.min(Math.max(currentPage, 1), totalPages)
    : 1;
  const start = (normalizedPage - 1) * safePageSize;

  return {
    pagedItems: items.slice(start, start + safePageSize),
    totalPages,
    totalPagesArray: Array.from({ length: totalPages }, (_, index) => index + 1),
  };
}
