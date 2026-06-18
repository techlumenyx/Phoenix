export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64');
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64').toString('utf-8');
}

export interface CursorQuery {
  _id?: { $gt: string };
  limit: number;
}

export function buildCursorQuery(after?: string | null, limit = 20): CursorQuery {
  const query: CursorQuery = { limit };
  if (after) {
    query._id = { $gt: decodeCursor(after) };
  }
  return query;
}
