export type AdminPageArgs = {
  limit?: number | null;
  offset?: number | null;
  sortBy?: string | null;
  sortDirection?: 'ASC' | 'DESC' | null;
};

export function adminPage(args: AdminPageArgs, defaultSort: string, allowedSorts: readonly string[]) {
  const limit = Math.min(Math.max(Math.trunc(args.limit ?? 10), 1), 100);
  const offset = Math.min(Math.max(Math.trunc(args.offset ?? 0), 0), 1_000_000);
  const sortBy = args.sortBy && allowedSorts.includes(args.sortBy) ? args.sortBy : defaultSort;
  const direction = args.sortDirection === 'ASC' ? 1 : -1;
  return {
    limit,
    offset,
    sort: { [sortBy]: direction, _id: direction } as Record<string, 1 | -1>,
  };
}

export function pageResult<T extends { id?: string }>(edges: T[], totalCount: number, limit: number, offset: number) {
  return {
    edges,
    totalCount,
    hasNextPage: offset + edges.length < totalCount,
    endCursor: edges.at(-1)?.id ?? null,
  };
}
