import { useCallback, useEffect, useRef } from 'react';
import { analyticsSurface, trackContentEvent, type AnalyticsEntityType } from '../lib/contentAnalytics';

export function entityIdFromHref(href: string | undefined, entityType: AnalyticsEntityType) {
  if (!href) return null;
  const segment = entityType === 'EVENT' ? 'events' : entityType === 'JOB' ? 'jobs' : 'marketplace';
  return href.match(new RegExp(`/${segment}/([a-f\\d]{24})(?:$|[/?#])`, 'i'))?.[1] ?? null;
}

export function useContentImpression(entityType: AnalyticsEntityType, href?: string, surface?: string, position?: number) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: HTMLElement | null) => { nodeRef.current = node; }, []);
  const entityId = entityIdFromHref(href, entityType);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !entityId || typeof IntersectionObserver === 'undefined') return;
    let visibleSince: ReturnType<typeof setTimeout> | null = null;
    let recorded = false;
    const cancel = () => { if (visibleSince) clearTimeout(visibleSince); visibleSince = null; };
    const observer = new IntersectionObserver(([entry]) => {
      if (recorded || !entry?.isIntersecting || entry.intersectionRatio < 0.5 || document.visibilityState !== 'visible') { cancel(); return; }
      if (!visibleSince) visibleSince = setTimeout(() => {
        if (document.visibilityState !== 'visible') return;
        recorded = true;
        observer.disconnect();
        trackContentEvent({ entityId, entityType, eventType: 'IMPRESSION', surface: surface ?? analyticsSurface(), position });
      }, 1000);
    }, { threshold: [0, 0.5, 1] });
    const onVisibility = () => { if (document.visibilityState !== 'visible') cancel(); };
    observer.observe(node);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { cancel(); observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility); };
  }, [entityId, entityType, position, surface]);

  return ref;
}
