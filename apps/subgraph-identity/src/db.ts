import type { Connection } from 'mongoose';

let _conn: Connection | null = null;

export function setConnection(conn: Connection): void {
  _conn = conn;
}

export function getConnection(): Connection {
  if (!_conn) throw new Error('[subgraph-identity] DB connection used before initialization');
  return _conn;
}
