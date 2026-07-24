type MediaService = 'identity' | 'events' | 'classifieds';

const LOCAL_PORTS: Record<MediaService, number> = {
  identity: 4001,
  events: 4002,
  classifieds: 4003,
};

export function resolveMediaEndpoint(
  configuredUrl: string | undefined,
  graphqlUrl: string | undefined,
  service: MediaService,
): string {
  if (configuredUrl?.trim()) return configuredUrl.trim();

  if (graphqlUrl?.trim()) {
    try {
      const gateway = new URL(graphqlUrl);
      const isLocal = ['localhost', '127.0.0.1', '::1'].includes(gateway.hostname);
      if (!isLocal) return new URL(`/media/${service}/upload`, gateway.origin).toString();
    } catch {
      // Fall through to the local development endpoint.
    }
  }

  return `http://localhost:${LOCAL_PORTS[service]}/media/upload`;
}
