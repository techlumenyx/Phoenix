import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackContentEvent, type AnalyticsEntityType } from '../../lib/contentAnalytics';

export default function RouteAnalytics() {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = pathname.match(/^\/(events|jobs|marketplace)\/([a-f\d]{24})$/i);
    if (!match) return;
    const types: Record<string, AnalyticsEntityType> = { events: 'EVENT', jobs: 'JOB', marketplace: 'MARKETPLACE' };
    trackContentEvent({ entityId: match[2], entityType: types[match[1].toLowerCase()], eventType: 'DETAIL_VIEW', surface: 'DETAIL_PAGE' });
  }, [pathname]);
  return null;
}
