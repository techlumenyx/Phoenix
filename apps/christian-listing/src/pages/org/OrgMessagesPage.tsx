import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';

const ORG_NOTIFICATIONS = gql`
  query OrganisationNotifications {
    myOrganisations { id name }
  }
`;

const APPLICATION_NOTIFICATIONS = gql`
  query ApplicationNotifications($organisationId: ID!) {
    organisationJobApplications(organisationId: $organisationId) {
      id fullName status createdAt
      listing { id title }
    }
  }
`;

interface ApplicationNotice { id: string; fullName: string; status: string; createdAt: string; listing: { id: string; title: string } }

export default function OrgMessagesPage() {
  const { data: orgData, loading: orgLoading } = useQuery(ORG_NOTIFICATIONS);
  const organisationId = orgData?.myOrganisations?.[0]?.id as string | undefined;
  const { data, loading, error } = useQuery<{ organisationJobApplications: ApplicationNotice[] }>(APPLICATION_NOTIFICATIONS, { variables: { organisationId }, skip: !organisationId, pollInterval: 60_000 });
  const notices = data?.organisationJobApplications ?? [];

  return <main className="mx-auto w-full max-w-5xl p-6">
    <div className="mb-6"><h1 className="font-serif text-4xl font-bold">Notifications</h1><p className="mt-2 text-sm text-gray-500">Updates requiring your organisation's attention.</p></div>
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {(orgLoading || loading) && <p className="p-12 text-center text-sm text-gray-500">Loading notifications...</p>}
      {error && <p className="p-12 text-center text-sm text-red-600">We couldn’t load organisation messages. Please try again.</p>}
      {!orgLoading && !loading && !error && notices.length === 0 && <div className="p-12 text-center"><h2 className="font-semibold">You are all caught up</h2><p className="mt-2 text-sm text-gray-500">New job applications and organisation updates will appear here.</p></div>}
      {notices.slice(0, 50).map((notice) => <Link to="/org/jobs" key={notice.id} className="flex items-center justify-between gap-5 border-b border-gray-100 px-6 py-5 last:border-0 hover:bg-gray-50">
        <div><p className="font-semibold text-gray-900">New application from {notice.fullName}</p><p className="mt-1 text-sm text-gray-500">{notice.listing.title} · {notice.status.replaceAll('_', ' ')}</p></div>
        <time className="shrink-0 text-xs text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</time>
      </Link>)}
    </section>
  </main>;
}
