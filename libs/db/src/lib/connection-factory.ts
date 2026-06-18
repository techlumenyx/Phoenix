import mongoose, { Connection, ConnectOptions } from 'mongoose';

const connections = new Map<string, Connection>();

export async function createMongoConnection(
  uri: string,
  dbName: string,
  options: ConnectOptions = {},
): Promise<Connection> {
  const key = `${uri}/${dbName}`;

  if (connections.has(key)) {
    return connections.get(key)!;
  }

  const connection = await mongoose.createConnection(uri, {
    dbName,
    autoIndex: true,
    ...options,
  }).asPromise();

  connections.set(key, connection);
  return connection;
}
