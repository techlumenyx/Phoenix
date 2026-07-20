import { gql, useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import RegistrationSuccessModal from '../components/events/RegistrationSuccessModal';
import EventCard from '../components/cards/EventCard';

const EVENT_DETAILS = gql`
  query EventDetails($id: ID!) {
    event(id: $id) {
      id title description category date endDate region
      rsvpCount interestedCount savedCount confirmedCount capacityLimit waitlistCount
      status imageUrls videoUrls videoPosterUrls isPromoted externalTicketUrl isRecurring seriesId occurrenceNumber isSeriesException
      location { type address city country virtualLink }
      hosts { id name description logoUrl region isVerified verificationTier websiteUrl }
      mySeriesRsvp { id stage }
      series {
        id
        recurrence { frequency interval daysOfWeek dayOfMonth timezone endsAt occurrenceCount }
        occurrences(limit: 20) { edges { id date status rsvpCount capacityLimit } }
      }
    }
    relatedEvents: events(status: PUBLISHED, sort: POPULAR, limit: 20) {
      edges { id title description category date region rsvpCount imageUrls location { city country type } }
    }
    myRsvps { id stage event { id } }
  }
`;

const RSVP_TO_EVENT = gql`
  mutation EventDetailsRsvp($eventId: ID!, $stage: RsvpStage!) {
    rsvpToEvent(eventId: $eventId, stage: $stage) { id stage }
  }
`;

const CANCEL_RSVP = gql`
  mutation EventDetailsCancelRsvp($eventId: ID!) {
    cancelRsvp(eventId: $eventId)
  }
`;

const RSVP_TO_SERIES = gql`
  mutation EventDetailsSeriesRsvp($seriesId: ID!, $stage: RsvpStage!) {
    rsvpToSeries(seriesId: $seriesId, stage: $stage) { id stage }
  }
`;

const CANCEL_SERIES_RSVP = gql`
  mutation EventDetailsCancelSeriesRsvp($seriesId: ID!) {
    cancelSeriesRsvp(seriesId: $seriesId)
  }
`;

type RsvpStage = 'INTERESTED' | 'SAVED' | 'CONFIRMED' | 'WAITLISTED';
interface EventDetailsData {
  event: null | {
    id: string; title: string; description: string; category: string; date: string; endDate?: string | null; region: string;
    rsvpCount: number; interestedCount: number; savedCount: number; confirmedCount: number; capacityLimit?: number | null; waitlistCount: number;
    status: string; imageUrls: string[]; videoUrls: string[]; videoPosterUrls: string[]; isPromoted: boolean; externalTicketUrl?: string | null;
    isRecurring: boolean; seriesId?: string | null; occurrenceNumber?: number | null; isSeriesException: boolean;
    mySeriesRsvp?: { id: string; stage: RsvpStage } | null;
    series?: { id: string; recurrence: { frequency: 'WEEKLY' | 'MONTHLY'; interval: number; daysOfWeek: number[]; dayOfMonth?: number | null; timezone: string; endsAt?: string | null; occurrenceCount?: number | null }; occurrences: { edges: Array<{ id: string; date: string; status: string; rsvpCount: number; capacityLimit?: number | null }> } } | null;
    location: { type: string; address?: string | null; city?: string | null; country?: string | null; virtualLink?: string | null };
    hosts: Array<{ id: string; name: string; description?: string | null; logoUrl?: string | null; region?: string | null; isVerified: boolean; verificationTier: string; websiteUrl?: string | null }>;
  };
  myRsvps: Array<{ id: string; stage: RsvpStage; event: { id: string } }>;
  relatedEvents: { edges: Array<{ id: string; title: string; description: string; category: string; date: string; region: string; rsvpCount: number; imageUrls: string[]; location: { city?: string | null; country?: string | null; type: string } }> };
}

export default function EventDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [notice, setNotice] = useState('');
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const { data, loading, error, refetch } = useQuery<EventDetailsData>(EVENT_DETAILS, { variables: { id }, skip: !id });
  const [rsvp, { loading: rsvpLoading }] = useMutation(RSVP_TO_EVENT);
  const [cancelRsvp, { loading: cancelLoading }] = useMutation(CANCEL_RSVP);
  const [rsvpSeries, { loading: seriesRsvpLoading }] = useMutation(RSVP_TO_SERIES);
  const [cancelSeriesRsvp, { loading: cancelSeriesLoading }] = useMutation(CANCEL_SERIES_RSVP);
  const event = data?.event;
  const currentStage = data?.myRsvps.find((entry) => entry.event.id === id)?.stage;

  const date = useMemo(() => event ? new Date(event.date) : null, [event]);
  const endDate = useMemo(() => event?.endDate ? new Date(event.endDate) : null, [event]);

  const setStage = async (stage: RsvpStage) => {
    if (!user) {
      navigate('/signin', { state: { from: location.pathname } });
      return;
    }
    const result = await rsvp({ variables: { eventId: id, stage } });
    const resolvedStage = result.data?.rsvpToEvent?.stage as RsvpStage | undefined;
    setNotice(resolvedStage === 'WAITLISTED' ? 'The event is full. You have joined the waitlist.' : stage === 'CONFIRMED' ? 'Your RSVP is confirmed.' : stage === 'SAVED' ? 'Event saved.' : 'Marked as interested.');
    if (resolvedStage === 'CONFIRMED') setShowRegistrationSuccess(true);
    await refetch();
  };

  const cancel = async () => {
    await cancelRsvp({ variables: { eventId: id } });
    setNotice('Your response was removed.');
    await refetch();
  };

  const attendSeries = async () => {
    if (!user) { navigate('/signin', { state: { from: location.pathname } }); return; }
    if (!event?.seriesId) return;
    await rsvpSeries({ variables: { seriesId: event.seriesId, stage: 'CONFIRMED' } });
    setNotice('You are registered for all future occurrences. Capacity is checked separately for each date.');
    await refetch();
  };

  const leaveSeries = async () => {
    if (!event?.seriesId) return;
    await cancelSeriesRsvp({ variables: { seriesId: event.seriesId } });
    setNotice('Future series registrations were removed. Past attendance history was kept.');
    await refetch();
  };

  const share = async () => {
    const shareData = { title: event?.title ?? 'Christian Listings event', url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setNotice('Event link copied.');
    }
  };

  if (loading) return <PageMessage title="Loading event…" />;
  if (error) return <PageMessage title="We couldn’t load this event" detail="Please try again in a moment." />;
  if (!event || !date) return <PageMessage title="Event not found" detail="This event may have been removed or the link may be incorrect." />;

  const host = event.hosts[0];
  const confirmed = event.confirmedCount || event.rsvpCount;
  const capacity = event.capacityLimit;
  const remaining = capacity == null ? null : Math.max(capacity - confirmed, 0);
  const capacityPercent = capacity ? Math.min((confirmed / capacity) * 100, 100) : 0;
  const locationText = [event.location.address, event.location.city, event.location.country].filter(Boolean).join(', ') || event.region;
  const relatedEvents = (data?.relatedEvents.edges ?? []).filter((related) => related.id !== event.id && related.category === event.category).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#fbfbfa] px-5 pb-8 pt-28 text-[#19141c] md:px-10 lg:px-16">
      {showRegistrationSuccess && <RegistrationSuccessModal event={event} onClose={() => setShowRegistrationSuccess(false)} />}
      <nav className="mx-auto max-w-7xl mb-5 text-sm font-serif text-gray-600" aria-label="Breadcrumb">
        <Link to="/events" className="hover:text-black">Events</Link> <span>›</span> <Link to="/events/all" className="hover:text-black">All Events</Link> <span>›</span> <span className="text-gray-900">Event Description</span>
      </nav>

      <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(310px,0.85fr)] lg:gap-12">
        <section>
          <div className="relative overflow-hidden rounded-xl bg-[#2a241e] aspect-[16/10] shadow-sm">
            <img src={event.imageUrls[0] || '/assets/event-theology.png'} alt={event.title} className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-[#8c3f86] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{event.category.replaceAll('_', '/')}</span>
            {event.isRecurring && <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#42113f]">Recurring series · #{event.occurrenceNumber}</span>}
            {host?.isVerified && <span className="absolute right-4 top-4 rounded-full bg-[#7acb37] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#17310b]">✓ Verified</span>}
          </div>
          {event.videoUrls.length > 0 && <section className="mt-5 grid gap-4 sm:grid-cols-2">{event.videoUrls.map((url, index) => <video key={url} src={url} poster={event.videoPosterUrls[index] ?? undefined} controls preload="metadata" className="aspect-video w-full rounded-xl bg-black object-contain" aria-label={`${event.title} video ${index + 1}`} />)}</section>}

          <article className="py-8">
            <h2 className="font-serif text-3xl font-bold">About the Experience</h2>
            {event.description.split(/\n\n+/).map((paragraph, index) => <p key={index} className="mt-4 max-w-4xl text-[15px] leading-7 text-gray-600">{paragraph}</p>)}
            <blockquote className="mt-7 rounded-md border-l-2 border-[#e5b83f] bg-[#f0f3fb] px-5 py-5 text-sm italic leading-6 text-gray-600">
              “Come expectant, leave encouraged, and make a meaningful connection with your community.”
            </blockquote>
          </article>
        </section>

        <aside className="lg:-mt-1">
          <h1 className="font-serif text-[28px] font-bold leading-[1.02]">{event.title}</h1>
          <div className="mt-7 space-y-5 text-sm">
            <InfoRow icon="▣" title={date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} detail={`${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}${endDate ? ` – ${endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''}`} />
            {event.series && <InfoRow icon="↻" title={`${event.series.recurrence.frequency === 'WEEKLY' ? 'Weekly' : 'Monthly'} series`} detail={`Every ${event.series.recurrence.interval > 1 ? `${event.series.recurrence.interval} ` : ''}${event.series.recurrence.frequency === 'WEEKLY' ? 'week(s)' : 'month(s)'} · ${event.series.recurrence.timezone}`} />}
            <InfoRow icon="⌖" title={event.location.type === 'VIRTUAL' ? 'Online event' : event.location.city || event.region} detail={locationText} link={event.location.type !== 'VIRTUAL' ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}` : event.location.virtualLink || undefined} />
            {event.location.type === 'HYBRID' && event.location.virtualLink && <InfoRow icon="↗" title="Join online" detail="Virtual attendance is available" link={event.location.virtualLink} />}
          </div>

          <div className="my-6 border-y border-gray-200 py-4">
            <div className="flex justify-between text-[11px]"><span className="text-gray-500">Community Response</span><strong>{confirmed} Confirmed</strong></div>
            {capacity && <><div className="mt-2 h-1 overflow-hidden rounded-full bg-[#dce5fb]"><div className="h-full bg-[#2a1b2d]" style={{ width: `${capacityPercent}%` }} /></div><p className="mt-2 text-[10px] text-gray-500">{remaining === 0 ? `${event.waitlistCount} people on the waitlist` : `Only ${remaining} spots remaining`}</p></>}
          </div>

          <div className="space-y-3">
            <button disabled={rsvpLoading || currentStage === 'CONFIRMED' || currentStage === 'WAITLISTED'} onClick={() => setStage('CONFIRMED')} className="w-full rounded-lg bg-[#42113f] px-4 py-3 text-sm font-medium text-white hover:bg-[#5a1956] disabled:opacity-60">{currentStage === 'CONFIRMED' ? 'RSVP Confirmed' : currentStage === 'WAITLISTED' ? 'On Waitlist' : remaining === 0 ? 'Join Waitlist' : 'Confirm RSVP'}</button>
            <div className="grid grid-cols-2 gap-3">
              <button disabled={rsvpLoading} onClick={() => setStage('INTERESTED')} className={`rounded-lg border px-4 py-3 text-sm ${currentStage === 'INTERESTED' ? 'border-[#42113f] bg-[#f8eff7]' : 'border-gray-400 bg-white'}`}>Interested</button>
              <button disabled={rsvpLoading} onClick={() => setStage('SAVED')} className={`rounded-lg border px-4 py-3 text-sm ${currentStage === 'SAVED' ? 'border-[#42113f] bg-[#f8eff7]' : 'border-gray-400 bg-white'}`}>{currentStage === 'SAVED' ? 'Saved' : 'Save Event'}</button>
            </div>
            {currentStage && <button disabled={cancelLoading} onClick={cancel} className="w-full py-1 text-xs text-gray-500 underline hover:text-gray-900">Remove my response</button>}
            {event.isRecurring && event.seriesId && <div className="rounded-xl border border-[#d9c5d7] bg-[#f8eff7] p-3"><p className="text-xs font-semibold text-[#42113f]">Attend the series</p><p className="mt-1 text-[11px] leading-5 text-gray-600">Register for each future occurrence. Full dates automatically place you on that occurrence’s waitlist.</p>{event.mySeriesRsvp ? <button disabled={cancelSeriesLoading} onClick={leaveSeries} className="mt-2 text-xs font-semibold text-red-600 underline">Stop attending future dates</button> : <button disabled={seriesRsvpLoading} onClick={attendSeries} className="mt-3 w-full rounded-lg border border-[#42113f] bg-white px-3 py-2 text-xs font-semibold text-[#42113f]">Attend all future dates</button>}</div>}
            {notice && <p role="status" className="text-center text-xs font-medium text-green-700">{notice}</p>}
          </div>

          {event.series && <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5"><h3 className="text-sm font-bold">Other dates in this series</h3><div className="mt-3 max-h-56 space-y-2 overflow-y-auto">{event.series.occurrences.edges.filter((occurrence) => occurrence.status !== 'CANCELLED').map((occurrence) => <Link key={occurrence.id} to={`/events/${occurrence.id}`} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${occurrence.id === event.id ? 'bg-[#f8eff7] font-semibold text-[#42113f]' : 'bg-gray-50 hover:bg-gray-100'}`}><span>{new Date(occurrence.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span><span>{occurrence.id === event.id ? 'Current' : `${occurrence.rsvpCount} going`}</span></Link>)}</div></section>}

          {host && <section className="mt-7 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ede5db] font-serif text-xl font-bold">{host.logoUrl ? <img src={host.logoUrl} alt="" className="h-full w-full object-cover" /> : host.name.charAt(0)}</div>
              <div className="min-w-0 flex-1"><h3 className="font-serif text-lg font-bold leading-tight">{host.name}</h3>{host.region && <p className="text-xs text-gray-500">{host.region}</p>}</div>
              <Link to={`/organisations/${host.id}`} className="rounded-full border px-3 py-1.5 text-[10px] hover:bg-gray-50">View Profile →</Link>
            </div>
            {host.description && <p className="mt-4 text-xs leading-5 text-gray-500">“{host.description}”</p>}
            <div className="mt-4 flex gap-5 text-[10px] text-gray-600"><span>◉ {host.verificationTier === 'CHARITY' ? 'Registered Charity' : 'Community Organisation'}</span>{host.isVerified && <span>✓ Verified Poster</span>}</div>
          </section>}

          <section className="mt-4 rounded-xl border border-gray-200 bg-[#eef3fd] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#1e3714]">◉ Sanctuary Trust Guarantee</h3>
            <p className="mt-2 pl-5 text-xs leading-4 text-gray-600">Verified organisers and transparent event information help keep the community safe.</p>
            <p className="mt-3 text-right text-[10px] font-bold underline">Learn about safe meetups →</p>
          </section>

          <div className="mt-7 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Share this event:</span>
            <button onClick={share} className="rounded-full bg-[#dfe8f7] px-4 py-2 text-xs font-semibold hover:bg-[#d2def0]">Share / Copy Link</button>
          </div>
        </aside>
      </div>
      <section className="mx-auto mt-14 max-w-7xl"><div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl font-bold">Related Events</h2><Link to={`/events/all?category=${event.category}`} className="text-xs font-semibold uppercase tracking-wider text-gray-500">View all events</Link></div>{relatedEvents.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{relatedEvents.map((related) => <EventCard key={related.id} badge={related.category.replaceAll('_', ' ')} date={new Date(related.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} title={related.title} description={related.description} location={[related.location.city, related.location.country].filter(Boolean).join(', ') || related.region} invites={`${related.rsvpCount} RSVPs`} imageSrc={related.imageUrls[0] || '/assets/event-theology.png'} href={`/events/${related.id}`} className="h-[330px]" />)}</div> : <p className="text-sm text-gray-500">No related events are available right now.</p>}</section>
    </main>
  );
}

function InfoRow({ icon, title, detail, link }: { icon: string; title: string; detail: string; link?: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-gray-600">{icon}</span><div><p className="font-medium">{title}</p><p className="mt-1 text-[11px] text-gray-500">{detail}</p>{link && <a href={link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[10px] underline">View Map</a>}</div></div>;
}

function PageMessage({ title, detail }: { title: string; detail?: string }) {
  return <main className="flex min-h-[65vh] items-center justify-center bg-[#fbfbfa] px-6 pt-20 text-center"><div><h1 className="font-serif text-3xl font-bold">{title}</h1>{detail && <p className="mt-3 text-sm text-gray-500">{detail}</p>}<Link to="/events" className="mt-6 inline-block rounded-full bg-[#42113f] px-5 py-2.5 text-sm text-white">Browse events</Link></div></main>;
}
