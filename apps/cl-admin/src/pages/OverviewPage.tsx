import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { useAdminAuth } from '../auth/authStore';

const workstreams = [
  { title: 'Marketplace moderation', detail: 'Durable report intake, triage, and content actions.', stage: 'Stage 1', to: '/moderation' },
  { title: 'Organisation verification', detail: 'Document review, decisions, and organisation updates.', stage: 'Stage 2', to: '/verifications' },
  { title: 'Platform directories', detail: 'Users, organisations, events, jobs, and listings.', stage: 'Stage 3', to: '/users' },
];
const STATS = gql`query AdminOverviewStats { adminDashboardStats { openModerationCases pendingVerifications overdueVerifications resolvedModerationLast7Days verificationDecisionsLast7Days } }`;

export default function OverviewPage() {
  const admin = useAdminAuth((state) => state.admin);
  const { data } = useQuery<{ adminDashboardStats: { openModerationCases: number; pendingVerifications: number; overdueVerifications: number; resolvedModerationLast7Days: number; verificationDecisionsLast7Days: number } }>(STATS);
  const stats = data?.adminDashboardStats;
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="flex flex-col justify-between gap-3 border-b border-[#DFE1E6] pb-5 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Operations overview</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#172B4D]">Welcome, {admin?.name.split(' ')[0]}</h2><p className="mt-1 text-sm text-slate-600">Live moderation, verification, and platform investigation workspaces.</p></div>
        <span className="w-fit rounded border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">Stages 0–3 active</span>
      </div>

      {stats && <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Operational queue summary">{[
        ['Open moderation', stats.openModerationCases], ['Pending verification', stats.pendingVerifications], ['Overdue verification', stats.overdueVerifications], ['Resolved · 7 days', stats.resolvedModerationLast7Days], ['Decisions · 7 days', stats.verificationDecisionsLast7Days],
      ].map(([title, value]) => <Link key={String(title)} to={String(title).includes('verification') || String(title).includes('Decisions') ? '/verifications' : '/moderation'} className="rounded-lg border bg-white p-4 hover:border-blue-300"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Link>)}</section>}

      <section className="mt-6 grid gap-4 md:grid-cols-3" aria-labelledby="workstream-heading">
        <h3 id="workstream-heading" className="sr-only">Admin workstreams</h3>
        {workstreams.map((item) => <Link key={item.title} to={item.to} className="group rounded-lg border border-[#DFE1E6] bg-white p-5 shadow-[0_1px_2px_rgba(9,30,66,0.08)] transition hover:border-blue-300 hover:shadow-sm"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-[#172B4D]">{item.title}</h4><span className="rounded bg-[#E9F2FF] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">{item.stage}</span></div><p className="mt-3 text-sm leading-5 text-slate-600">{item.detail}</p><p className="mt-5 text-xs font-semibold text-blue-700 group-hover:text-blue-800">Open workspace →</p></Link>)}
      </section>

      <section className="mt-6 rounded-lg border border-[#DFE1E6] bg-white">
        <div className="border-b border-[#DFE1E6] px-5 py-4"><h3 className="text-sm font-semibold">Access context</h3><p className="mt-1 text-xs text-slate-500">Your current server-verified administrator profile.</p></div>
        <dl className="grid gap-px bg-[#DFE1E6] sm:grid-cols-3">
          <div className="bg-white px-5 py-4"><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Account</dt><dd className="mt-1 truncate text-sm font-medium">{admin?.email}</dd></div>
          <div className="bg-white px-5 py-4"><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-1 text-sm font-medium text-green-700">{admin?.status}</dd></div>
          <div className="bg-white px-5 py-4"><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Permissions</dt><dd className="mt-1 text-sm font-medium">{admin?.roles.map((role) => role.replaceAll('_', ' ')).join(', ')}</dd></div>
        </dl>
      </section>
    </div>
  );
}
