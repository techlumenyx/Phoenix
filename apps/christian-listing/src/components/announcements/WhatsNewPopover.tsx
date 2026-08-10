import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const CURRENT = gql`query CurrentProductAnnouncement { currentProductAnnouncement { id releaseKey title summary body imageUrl imageAlt videoUrl buttonLabel buttonUrl publishedAt } }`;
const SEEN = gql`mutation MarkProductAnnouncementSeen($id: ID!) { markProductAnnouncementSeen(id: $id) }`;
type Announcement = { id: string; releaseKey: string; title: string; summary: string | null; body: string; imageUrl: string | null; imageAlt: string | null; videoUrl: string | null; buttonLabel: string | null; buttonUrl: string | null; publishedAt: string | null };

export default function WhatsNewPopover() {
  const user = useAuthStore((state) => state.user); const [open, setOpen] = useState(true);
  const { data } = useQuery<{ currentProductAnnouncement: Announcement | null }>(CURRENT, { skip: !user, fetchPolicy: 'network-only' });
  const [markSeen] = useMutation(SEEN); const item = data?.currentProductAnnouncement;
  useEffect(() => { if (item?.id) void markSeen({ variables: { id: item.id } }); }, [item?.id, markSeen]);
  if (!user || !item || !open) return null;
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="whats-new-title" onMouseDown={() => setOpen(false)}><article className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>{item.imageUrl && <img src={item.imageUrl} alt={item.imageAlt ?? ''} className="h-56 w-full object-cover" />}<div className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9A7744]">What’s New</p><h2 id="whats-new-title" className="mt-2 font-serif text-3xl font-semibold text-[#1B1B1B]">{item.title}</h2></div><button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-100 text-xl text-gray-600" aria-label="Close">×</button></div>{item.summary && <p className="mt-3 text-base text-gray-600">{item.summary}</p>}<div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-700">{item.body}</div>{item.videoUrl && <video src={item.videoUrl} controls preload="metadata" className="mt-5 w-full rounded-xl" />}{item.buttonLabel && item.buttonUrl && <a href={item.buttonUrl} className="mt-6 inline-flex rounded-full bg-[#1B1B1B] px-5 py-2.5 text-sm font-semibold text-white">{item.buttonLabel}</a>}<div className="mt-6 border-t pt-4"><Link to="/whats-new" onClick={() => setOpen(false)} className="text-sm font-semibold text-[#8A6939]">View previous updates →</Link></div></div></article></div>;
}
