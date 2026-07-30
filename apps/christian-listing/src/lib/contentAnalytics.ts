import { gql } from '@apollo/client';
import { apolloClient } from '../apolloClient';

export type AnalyticsEntityType = 'EVENT' | 'JOB' | 'MARKETPLACE';
type AnalyticsEvent = { entityId: string; entityType: AnalyticsEntityType; eventType: 'IMPRESSION' | 'DETAIL_VIEW'; surface: string; position?: number | null; sessionId: string };

const SESSION_KEY = 'cl_analytics_session';
const MAX_BATCH = 20;
const FLUSH_DELAY = 4000;
const queue: AnalyticsEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

const RECORD_EVENT_ANALYTICS = gql`mutation RecordEventAnalytics($events: [EventAnalyticsInput!]!) { recordEventAnalytics(events: $events) }`;
const RECORD_CLASSIFIED_ANALYTICS = gql`mutation RecordClassifiedAnalytics($events: [ClassifiedAnalyticsInput!]!) { recordClassifiedAnalytics(events: $events) }`;

function sessionId() {
  let value = window.sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

export function analyticsSurface(pathname = window.location.pathname) {
  if (pathname === '/') return 'HOME';
  if (pathname === '/search') return 'GLOBAL_SEARCH';
  if (pathname.includes('/all')) return 'DIRECTORY';
  if (pathname.startsWith('/dashboard/saved')) return 'SAVED_ITEMS';
  if (pathname.startsWith('/dashboard/following')) return 'FOLLOWING';
  if (/^\/(events|jobs|marketplace)\/[a-f\d]{24}$/i.test(pathname)) return 'RELATED_CONTENT';
  if (pathname.startsWith('/organisations/')) return 'ORGANISATION_PROFILE';
  return 'DISCOVERY';
}

async function flush() {
  if (flushing || !queue.length) return;
  flushing = true;
  if (timer) { clearTimeout(timer); timer = null; }
  const batch = queue.splice(0, MAX_BATCH);
  const events = batch.filter((event) => event.entityType === 'EVENT').map((event) => ({ entityId: event.entityId, eventType: event.eventType, surface: event.surface, position: event.position, sessionId: event.sessionId }));
  const classifieds = batch.filter((event) => event.entityType !== 'EVENT').map((event) => ({ ...event, entityType: event.entityType }));
  await Promise.allSettled([
    events.length ? apolloClient.mutate({ mutation: RECORD_EVENT_ANALYTICS, variables: { events }, fetchPolicy: 'no-cache', errorPolicy: 'ignore' }) : Promise.resolve(),
    classifieds.length ? apolloClient.mutate({ mutation: RECORD_CLASSIFIED_ANALYTICS, variables: { events: classifieds }, fetchPolicy: 'no-cache', errorPolicy: 'ignore' }) : Promise.resolve(),
  ]);
  flushing = false;
  if (queue.length) schedule();
}

function schedule() {
  if (!timer) timer = setTimeout(() => void flush(), FLUSH_DELAY);
}

export function trackContentEvent(event: Omit<AnalyticsEvent, 'sessionId'>) {
  if (typeof window === 'undefined' || document.visibilityState !== 'visible') return;
  queue.push({ ...event, sessionId: sessionId() });
  if (queue.length >= MAX_BATCH) void flush(); else schedule();
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => void flush());
}
