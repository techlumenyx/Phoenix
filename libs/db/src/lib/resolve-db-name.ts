export function resolveDbName(baseName: string): string {
  const suffix = process.env['MONGO_DB_SUFFIX'];
  return suffix ? `${baseName}${suffix}` : baseName;
}
