import { gql, useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MY_ORGANISATIONS } from '../../graphql/mutations';
import DirectoryState from '../../components/ui/DirectoryState';
import { useToast } from '../../components/ui/ToastProvider';

const NOTIFICATIONS = gql`
  query OrganisationNotificationCentre($organisationId: ID!, $unreadOnly: Boolean, $limit: Int) {
    identityOrganisationNotifications(
      organisationId: $organisationId
      unreadOnly: $unreadOnly
      limit: $limit
    ) {
      id
      type
      title
      message
      href
      sourceId
      readAt
      createdAt
    }
    eventOrganisationNotifications(
      organisationId: $organisationId
      unreadOnly: $unreadOnly
      limit: $limit
    ) {
      id
      type
      title
      message
      href
      sourceId
      readAt
      createdAt
    }
    classifiedOrganisationNotifications(
      organisationId: $organisationId
      unreadOnly: $unreadOnly
      limit: $limit
    ) {
      id
      type
      title
      message
      href
      sourceId
      readAt
      createdAt
    }
    identityOrganisationUnreadCount(organisationId: $organisationId)
    eventOrganisationUnreadCount(organisationId: $organisationId)
    classifiedOrganisationUnreadCount(organisationId: $organisationId)
  }
`;
const MARK_IDENTITY_READ = gql`
  mutation MarkIdentityNotificationRead($id: ID!) {
    markIdentityOrganisationNotificationRead(id: $id) {
      id
      readAt
    }
  }
`;
const MARK_EVENT_READ = gql`
  mutation MarkEventNotificationRead($id: ID!) {
    markEventOrganisationNotificationRead(id: $id) {
      id
      readAt
    }
  }
`;
const MARK_CLASSIFIED_READ = gql`
  mutation MarkClassifiedNotificationRead($id: ID!) {
    markClassifiedOrganisationNotificationRead(id: $id) {
      id
      readAt
    }
  }
`;
const MARK_ALL_READ = gql`
  mutation MarkAllOrganisationNotificationsRead($organisationId: ID!) {
    identity: markAllIdentityOrganisationNotificationsRead(organisationId: $organisationId)
    events: markAllEventOrganisationNotificationsRead(organisationId: $organisationId)
    classified: markAllClassifiedOrganisationNotificationsRead(organisationId: $organisationId)
  }
`;

type Source = 'identity' | 'events' | 'classified';
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  href?: string | null;
  sourceId?: string | null;
  readAt?: string | null;
  createdAt: string;
  source: Source;
}
interface NotificationData {
  identityOrganisationNotifications: Omit<NotificationItem, 'source'>[];
  eventOrganisationNotifications: Omit<NotificationItem, 'source'>[];
  classifiedOrganisationNotifications: Omit<NotificationItem, 'source'>[];
  identityOrganisationUnreadCount: number;
  eventOrganisationUnreadCount: number;
  classifiedOrganisationUnreadCount: number;
}

const FILTERS = [
  ['ALL', 'All'],
  ['UNREAD', 'Unread'],
  ['NEW_FOLLOWER', 'Followers'],
  ['RSVP_MILESTONE', 'RSVP milestones'],
  ['LISTING_REPORTED', 'Listing reports'],
  ['VERIFICATION_UPDATE', 'Verification'],
] as const;
const TYPE_STYLE: Record<string, { icon: string; colour: string }> = {
  NEW_FOLLOWER: { icon: '＋', colour: 'bg-[#EEE6EF] text-[#5C2D5F]' },
  RSVP_MILESTONE: { icon: '✓', colour: 'bg-green-100 text-green-700' },
  LISTING_REPORTED: { icon: '!', colour: 'bg-red-100 text-red-700' },
  VERIFICATION_UPDATE: { icon: '◇', colour: 'bg-blue-100 text-blue-700' },
};

function relativeTime(value: string) {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function OrgNotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: organisationData, loading: organisationLoading } = useQuery(MY_ORGANISATIONS);
  const organisationId = organisationData?.myOrganisations?.[0]?.id as string | undefined;
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>('ALL');
  const { data, loading, error, refetch } = useQuery<NotificationData>(NOTIFICATIONS, {
    variables: { organisationId, unreadOnly: filter === 'UNREAD', limit: 100 },
    skip: !organisationId,
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  });
  const [markIdentity] = useMutation(MARK_IDENTITY_READ);
  const [markEvent] = useMutation(MARK_EVENT_READ);
  const [markClassified] = useMutation(MARK_CLASSIFIED_READ);
  const [markAll, { loading: markingAll }] = useMutation(MARK_ALL_READ);

  const items = useMemo(() => {
    if (!data) return [];
    const merged: NotificationItem[] = [
      ...data.identityOrganisationNotifications.map((item) => ({
        ...item,
        source: 'identity' as const,
      })),
      ...data.eventOrganisationNotifications.map((item) => ({
        ...item,
        source: 'events' as const,
      })),
      ...data.classifiedOrganisationNotifications.map((item) => ({
        ...item,
        source: 'classified' as const,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return filter === 'ALL' || filter === 'UNREAD'
      ? merged
      : merged.filter((item) => item.type === filter);
  }, [data, filter]);
  const unreadCount =
    (data?.identityOrganisationUnreadCount ?? 0) +
    (data?.eventOrganisationUnreadCount ?? 0) +
    (data?.classifiedOrganisationUnreadCount ?? 0);

  async function read(item: NotificationItem, followLink = true) {
    if (!item.readAt) {
      const mutation =
        item.source === 'identity'
          ? markIdentity
          : item.source === 'events'
            ? markEvent
            : markClassified;
      await mutation({ variables: { id: item.id } });
      await refetch();
    }
    if (followLink && item.href) navigate(item.href);
  }
  async function readAll() {
    if (!organisationId) return;
    try {
      await markAll({ variables: { organisationId } });
      await refetch();
      showToast('All notifications marked as read.', 'success');
    } catch {
      showToast('Notifications could not be updated. Please try again.', 'error');
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-4xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#302D2E] px-2.5 py-1 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Follower activity, RSVP milestones, listing reports, and verification updates.
          </p>
        </div>
        <button
          onClick={readAll}
          disabled={!unreadCount || markingAll}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
        >
          {markingAll ? 'Updating…' : 'Mark all as read'}
        </button>
      </div>
      <div className="mt-7 flex gap-2 overflow-x-auto border-b border-gray-200 pb-4">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-[#302D2E] text-white' : 'bg-white text-gray-600'}`}
          >
            {label}
            {value === 'UNREAD' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>
      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {(organisationLoading || (loading && !data)) && (
          <div className="p-6">
            <DirectoryState kind="loading" />
          </div>
        )}
        {error && (
          <div className="p-6">
            <DirectoryState
              kind="error"
              title="Notifications could not be loaded"
              onRetry={() => refetch()}
            />
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="p-6">
            <DirectoryState
              kind="empty"
              title={filter === 'UNREAD' ? 'You are all caught up' : 'No notifications yet'}
              detail="New organisation activity will appear here."
            />
          </div>
        )}
        {items.map((item) => {
          const style = TYPE_STYLE[item.type] ?? { icon: '•', colour: 'bg-gray-100 text-gray-700' };
          return (
            <button
              key={`${item.source}:${item.id}`}
              onClick={() => read(item)}
              className={`flex w-full items-start gap-4 border-b border-gray-100 p-5 text-left last:border-0 hover:bg-gray-50 ${item.readAt ? 'bg-white' : 'bg-[#FFFBF2]'}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${style.colour}`}
              >
                {style.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm text-[#1B1B1B]">{item.title}</strong>
                  <span className="text-xs text-gray-400">{relativeTime(item.createdAt)}</span>
                </span>
                <span className="mt-1 block text-sm leading-6 text-gray-600">{item.message}</span>
                {item.href && (
                  <span className="mt-2 block text-xs font-semibold text-gray-700">
                    View details →
                  </span>
                )}
              </span>
              {!item.readAt && (
                <span
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C9A96E]"
                  aria-label="Unread"
                />
              )}
            </button>
          );
        })}
      </section>
    </main>
  );
}
