import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { MY_ORGANISATIONS } from '../../graphql/mutations';
import { AnalyticsSummaryCards, useOrganisationAnalytics, type AnalyticsSummary } from '../../components/analytics/OrganisationAnalytics';

function rate(outcomes: number, visits: number) { return visits ? `${Math.round(outcomes / visits * 100)}%` : '—'; }

function AreaRow({ label, data, outcomeLabel }: { label: string; data: AnalyticsSummary; outcomeLabel: string }) {
  return <tr className="border-t border-gray-100"><td className="py-4 font-semibold text-[#1B1B1B]">{label}</td><td className="py-4 text-right">{data.uniqueReach.toLocaleString()}</td><td className="py-4 text-right">{data.detailViews.toLocaleString()}</td><td className="py-4 text-right"><span className="font-semibold">{data.outcomes.toLocaleString()}</span><span className="block text-[10px] text-gray-400">{outcomeLabel}</span></td><td className="py-4 text-right font-semibold">{rate(data.outcomes, data.detailViews)}</td></tr>;
}

export default function OrgAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data: orgData } = useQuery<{ myOrganisations: { id: string; name: string | null }[] }>(MY_ORGANISATIONS);
  const organisationId = orgData?.myOrganisations?.[0]?.id;
  const { data, loading } = useOrganisationAnalytics(organisationId, days);
  const areas = data ? [
    { label: 'Events', outcome: 'RSVPs', value: data.eventOrganisationAnalytics },
    { label: 'Jobs', outcome: 'Applications', value: data.classifiedOrganisationAnalytics.jobs },
    { label: 'Marketplace', outcome: 'Conversations', value: data.classifiedOrganisationAnalytics.marketplace },
  ] : [];
  const top = areas.flatMap((area) => area.value.topContent.map((item) => ({ ...item, area: area.label }))).sort((a, b) => b.detailViews - a.detailViews || b.impressions - a.impressions).slice(0, 10);
  return <div className="min-h-full bg-[#FAFAF8] px-6 lg:px-10 py-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#9A7B3F]">Organisation performance</p><h1 className="font-serif text-3xl font-bold text-[#1B1B1B] mt-1">Analytics</h1><p className="text-sm text-gray-500 mt-2">Understand discovery, consideration and real community actions.</p></div><select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></div>
      {organisationId && <AnalyticsSummaryCards organisationId={organisationId} days={days} data={data} skipFetch />}
      <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-6 mt-7">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><h2 className="font-serif text-xl font-bold">Performance by area</h2><p className="text-xs text-gray-500 mt-1">Impressions support reach calculations but qualified visits and outcomes show stronger intent.</p>{loading ? <div className="h-48 mt-6 bg-gray-50 animate-pulse rounded-xl" /> : <div className="overflow-x-auto mt-5"><table className="w-full text-sm"><thead><tr className="text-xs text-gray-400"><th className="pb-3 text-left font-medium">Area</th><th className="pb-3 text-right font-medium">Reach</th><th className="pb-3 text-right font-medium">Visits</th><th className="pb-3 text-right font-medium">Outcomes</th><th className="pb-3 text-right font-medium">Conversion</th></tr></thead><tbody>{areas.map((area) => <AreaRow key={area.label} label={area.label} data={area.value} outcomeLabel={area.outcome} />)}</tbody></table></div>}</section>
        <section className="rounded-2xl border border-gray-100 bg-[#1D2A22] text-white p-6 shadow-sm"><h2 className="font-serif text-xl font-bold">What to act on</h2><div className="space-y-4 mt-5 text-sm text-white/75">{areas.length ? areas.map((area) => { const viewRate = rate(area.value.detailViews, area.value.uniqueReach); return <div key={area.label} className="border-b border-white/10 pb-4 last:border-0"><p className="text-white font-semibold">{area.label}</p><p className="mt-1">{viewRate} of reached viewers opened a detail page; {area.value.outcomes} {area.outcome.toLowerCase()} followed.</p></div>; }) : <p>Insights will appear after your content starts receiving qualified views.</p>}</div></section>
      </div>
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-6"><h2 className="font-serif text-xl font-bold">Content attracting attention</h2><p className="text-xs text-gray-500 mt-1">Ranked by detail-page interest, then discovery impressions.</p><div className="overflow-x-auto mt-5"><table className="w-full text-sm"><thead><tr className="text-xs text-gray-400"><th className="pb-3 text-left font-medium">Content</th><th className="pb-3 text-left font-medium">Area</th><th className="pb-3 text-right font-medium">Impressions</th><th className="pb-3 text-right font-medium">Reach</th><th className="pb-3 text-right font-medium">Detail visits</th></tr></thead><tbody>{top.length ? top.map((item) => <tr key={`${item.area}-${item.id}`} className="border-t border-gray-100"><td className="py-4 font-semibold">{item.title}</td><td className="py-4 text-gray-500">{item.area}</td><td className="py-4 text-right">{item.impressions}</td><td className="py-4 text-right">{item.uniqueReach}</td><td className="py-4 text-right font-semibold">{item.detailViews}</td></tr>) : <tr><td colSpan={5} className="py-12 text-center text-gray-400">No measured activity in this period yet.</td></tr>}</tbody></table></div></section>
      <p className="text-[11px] text-gray-400 mt-5">An impression counts only after at least 50% of a content card is visible for one continuous second. Repeat views are deduplicated for 30 minutes and organisation team activity is excluded.</p>
    </div>
  </div>;
}
