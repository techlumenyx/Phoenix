import { gql, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const ORGANISATION_ANALYTICS = gql`
  query OrganisationPerformanceAnalytics($organisationId: ID!, $from: DateTime, $to: DateTime) {
    eventOrganisationAnalytics(organisationId: $organisationId, from: $from, to: $to) {
      impressions uniqueReach detailViews outcomes activeContent
      daily { date impressions uniqueReach detailViews }
      topContent { id title impressions uniqueReach detailViews }
    }
    classifiedOrganisationAnalytics(organisationId: $organisationId, from: $from, to: $to) {
      jobs { impressions uniqueReach detailViews outcomes activeContent daily { date impressions uniqueReach detailViews } topContent { id title impressions uniqueReach detailViews } }
      marketplace { impressions uniqueReach detailViews outcomes activeContent daily { date impressions uniqueReach detailViews } topContent { id title impressions uniqueReach detailViews } }
    }
  }
`;

export interface AnalyticsSummary { impressions: number; uniqueReach: number; detailViews: number; outcomes: number; activeContent: number; daily: { date: string; impressions: number; uniqueReach: number; detailViews: number }[]; topContent: { id: string; title: string; impressions: number; uniqueReach: number; detailViews: number }[] }
export interface OrganisationAnalyticsData { eventOrganisationAnalytics: AnalyticsSummary; classifiedOrganisationAnalytics: { jobs: AnalyticsSummary; marketplace: AnalyticsSummary } }

export function useOrganisationAnalytics(organisationId: string | undefined, days = 30, skip = false) {
  const variables = useMemo(() => { const to = new Date(); const from = new Date(to.getTime() - days * 86400000); return { organisationId, from: from.toISOString(), to: to.toISOString() }; }, [organisationId, days]);
  return useQuery<OrganisationAnalyticsData>(ORGANISATION_ANALYTICS, { variables, skip: skip || !organisationId, fetchPolicy: 'cache-and-network' });
}

function percent(value: number, denominator: number) { return denominator ? `${Math.round((value / denominator) * 100)}%` : '—'; }
function compact(value: number) { return Intl.NumberFormat(undefined, { notation: value >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value); }

export function AnalyticsSummaryCards({ organisationId, compactView = false, days = 30, data: suppliedData, skipFetch = false }: { organisationId: string; compactView?: boolean; days?: number; data?: OrganisationAnalyticsData; skipFetch?: boolean }) {
  const query = useOrganisationAnalytics(organisationId, days, skipFetch);
  const data = suppliedData ?? query.data; const loading = query.loading; const error = query.error;
  const areas = data ? [data.eventOrganisationAnalytics, data.classifiedOrganisationAnalytics.jobs, data.classifiedOrganisationAnalytics.marketplace] : [];
  const totals = areas.reduce((sum, row) => ({ impressions: sum.impressions + row.impressions, reach: sum.reach + row.uniqueReach, detailViews: sum.detailViews + row.detailViews, outcomes: sum.outcomes + row.outcomes, active: sum.active + row.activeContent }), { impressions: 0, reach: 0, detailViews: 0, outcomes: 0, active: 0 });
  const cards = [
    { label: 'Content reach', value: compact(totals.reach), description: 'Deduplicated viewers within each content area', tone: 'bg-[#FEFCE2] border-[#EBEAAB]' },
    { label: 'Qualified visits', value: compact(totals.detailViews), description: 'People who opened a detail page', tone: 'bg-[#ECFDE8] border-[#C8E8BC]' },
    { label: 'Meaningful outcomes', value: compact(totals.outcomes), description: 'RSVPs, applications and buyer conversations', tone: 'bg-[#FFF3F2] border-[#EBE0DF]' },
    { label: 'Outcome conversion', value: percent(totals.outcomes, totals.detailViews), description: 'Outcomes from qualified visits', tone: 'bg-[#F2FCFA] border-[#D9EBE8]' },
    { label: 'Active content', value: compact(totals.active), description: 'Published events, jobs and listings', tone: 'bg-[#FDF0F5] border-[#EADCE3]' },
  ];
  if (!data && (loading || skipFetch)) return <div className="h-36 rounded-xl bg-gray-50 animate-pulse" />;
  if (error) return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Analytics are temporarily unavailable. Your content is still working normally.</div>;
  return <div>
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => <div key={card.label} className={`${card.tone} border rounded-xl p-5 min-h-[145px]`}><p className="font-serif text-lg font-bold text-[#1B1B1B]">{card.label}</p><p className="text-[11px] text-gray-500 mt-1 min-h-[32px]">{card.description}</p><p className="font-serif text-3xl font-bold text-[#1B1B1B] mt-4">{card.value}</p></div>)}
    </div>
    {compactView && <div className="mt-4 text-right"><Link to="/org/analytics" className="text-sm font-semibold text-[#846528] hover:underline">View detailed analytics →</Link></div>}
  </div>;
}
