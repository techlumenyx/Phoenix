export interface OffsetPaginationArgs {
  page?: number | null;
  limit?: number | null;
}

export interface OffsetPaginationQuery {
  skip: number;
  limit: number;
}

export function buildOffsetQuery(args: OffsetPaginationArgs = {}): OffsetPaginationQuery {
  const limit = Math.min(args.limit ?? 20, 100);
  const page = Math.max(args.page ?? 1, 1);
  return { skip: (page - 1) * limit, limit };
}
