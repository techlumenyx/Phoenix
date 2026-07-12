import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { formatPrice } from '../lib/discovery';
import { useAuthStore } from '../store/authStore';

const JOB_DETAILS = gql`
  query JobDetails($id: ID!) {
    jobListing(id: $id) {
      id title description roleType workLocation skillsRequired region
      salaryRange { min max currency }
      applicationDeadline externalApplyUrl status faithAlignmentTag
      responsibilities educationalRequirement experience certifications otherSkills
      faithDescription keyFaithRequirements applicationCount createdAt
      organisation { id name isVerified description logoUrl region verificationTier websiteUrl }
    }
  }
`;
const JOB_SAVED = gql`query JobSavedState($id: ID!) { isJobSaved(id: $id) }`;
const SAVE_JOB = gql`mutation SaveJobDetails($id: ID!) { saveJob(id: $id) }`;
const UNSAVE_JOB = gql`mutation UnsaveJobDetails($id: ID!) { unsaveJob(id: $id) }`;

interface JobDetailsData {
  jobListing: null | {
    id: string; title: string; description: string; roleType: string; workLocation: string; skillsRequired: string[]; region: string;
    salaryRange?: { min: number; max: number; currency: string } | null; applicationDeadline: string; externalApplyUrl?: string | null;
    status: string; faithAlignmentTag?: string | null; responsibilities: string[]; educationalRequirement?: string | null;
    experience?: string | null; certifications?: string | null; otherSkills?: string | null; faithDescription?: string | null;
    keyFaithRequirements: string[]; applicationCount: number; createdAt: string;
    organisation: { id: string; name: string; isVerified: boolean; description?: string | null; logoUrl?: string | null; region?: string | null; verificationTier: string; websiteUrl?: string | null };
  };
}

export default function JobDetailsPage() {
  const { id = '' } = useParams();
  const user = useAuthStore((state) => state.user); const navigate = useNavigate(); const location = useLocation();
  const [notice, setNotice] = useState('');
  const { data, loading, error } = useQuery<JobDetailsData>(JOB_DETAILS, { variables: { id }, skip: !id });
  const { data: savedData, refetch: refetchSaved } = useQuery<{ isJobSaved: boolean }>(JOB_SAVED, { variables: { id }, skip: !id || !user });
  const [saveJob, { loading: saving }] = useMutation(SAVE_JOB); const [unsaveJob] = useMutation(UNSAVE_JOB);
  const saved = savedData?.isJobSaved ?? false;
  const job = data?.jobListing;

  const share = async () => {
    const shareData = { title: job?.title ?? 'Christian Listings job', url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      setNotice('Job link copied.');
    }
  };
  const toggleSaved = async () => { if (!user) { navigate('/signin', { state: { from: location.pathname } }); return; } await (saved ? unsaveJob : saveJob)({ variables: { id } }); setNotice(saved ? 'Removed from saved items.' : 'Job saved.'); await refetchSaved(); };

  if (loading) return <PageMessage title="Loading job…" />;
  if (error) return <PageMessage title="We couldn’t load this job" detail={error.message} />;
  if (!job) return <PageMessage title="Job not found" detail="This role may have closed or the link may be incorrect." />;

  const organisation = job.organisation;
  const deadline = new Date(job.applicationDeadline);
  const createdAt = new Date(job.createdAt);
  const daysAgo = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 86400000));
  const salary = job.salaryRange ? `${formatPrice(job.salaryRange.min, job.salaryRange.currency)} – ${formatPrice(job.salaryRange.max, job.salaryRange.currency)}` : 'Salary not disclosed';
  const requirements = [job.educationalRequirement, job.experience, job.certifications, job.otherSkills].filter(Boolean) as string[];
  const responsibilities = job.responsibilities.length ? job.responsibilities : ['Work collaboratively with the organisation team.', 'Serve the community with care, integrity and professionalism.'];
  const isActive = job.status === 'ACTIVE' && deadline.getTime() >= Date.now();

  return (
    <main className="min-h-screen bg-[#fbfbfa] px-5 py-8 text-[#19141c] md:px-10 lg:px-16">
      <nav className="mx-auto mb-7 max-w-7xl text-sm font-serif text-gray-600" aria-label="Breadcrumb">
        <Link to="/jobs" className="hover:text-black">Jobs</Link> <span>›</span> <Link to="/jobs/all" className="hover:text-black">All Jobs</Link> <span>›</span> <span className="text-gray-900">Job Description</span>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-9 lg:grid-cols-[minmax(0,1.75fr)_minmax(310px,0.85fr)] lg:gap-14">
        <article>
          <header className="mb-5">
            <h1 className="font-serif text-3xl font-bold">{job.title}</h1>
            <p className="mt-2 text-lg tracking-wide">{organisation.name}</p>
          </header>

          <JobSection title="About the Role">
            {job.description.split(/\n\n+/).map((paragraph, index) => <p key={index} className="text-[15px] leading-7 text-gray-600">{paragraph}</p>)}
          </JobSection>

          <JobSection title="Responsibilities">
            <BulletList items={responsibilities} />
          </JobSection>

          <JobSection title="Requirements">
            {requirements.length ? <BulletList items={requirements} /> : <BulletList items={[`Skills welcomed: ${job.skillsRequired.join(', ') || 'relevant experience'}.`]} />}
          </JobSection>

          {(job.faithAlignmentTag || job.faithDescription || job.keyFaithRequirements.length > 0) && (
            <section className="mt-8 rounded-xl bg-[#eef3fd] p-6">
              <h2 className="font-serif text-xl font-bold">✣ Faith Alignment</h2>
              <p className="mt-4 text-sm italic leading-6 text-gray-600">{job.faithDescription || (job.faithAlignmentTag === 'FAITH_BACKGROUND_PREFERRED' ? 'A personal Christian faith and active participation in a local church are preferred for this role.' : 'This opportunity is open to all candidates who support the organisation’s community values.')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.keyFaithRequirements.length ? job.keyFaithRequirements : [job.faithAlignmentTag === 'FAITH_BACKGROUND_PREFERRED' ? 'Faith Background Preferred' : 'Open to All']).map((tag) => <span key={tag} className="rounded-full border border-[#cbd5e5] bg-[#f7f9fd] px-3 py-1 text-xs">{tag}</span>)}
              </div>
              {job.faithAlignmentTag === 'FAITH_BACKGROUND_PREFERRED' && <p className="mt-7 text-xs leading-5 text-gray-600">Candidates may be asked to demonstrate alignment with the organisation’s statement of faith.</p>}
            </section>
          )}
        </article>

        <aside>
          <section className="rounded-xl bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Position Status</p>
            <p className={`mt-1 text-xs font-semibold ${isActive ? 'text-green-700' : 'text-red-700'}`}>● {isActive ? 'Actively Recruiting' : 'Closed'}</p>

            <div className="mt-7 space-y-4 text-sm">
              <MetaRow icon="⌖" value={job.region} />
              <MetaRow icon="◷" value={`${job.roleType.replaceAll('_', ' ')} · ${job.workLocation.replaceAll('_', ' ')}`} />
              <MetaRow icon="◷" value={`Closing Date · ${deadline.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}`} />
              <MetaRow icon="▣" value={salary} />
            </div>

            <div className="my-6 flex justify-between border-t border-gray-200 pt-4 text-[10px] text-gray-500"><span>Posted {daysAgo === 0 ? 'Today' : `${daysAgo} Day${daysAgo === 1 ? '' : 's'} Ago`}</span><strong className="text-gray-900">{job.applicationCount}+ Applications</strong></div>

            {isActive ? <Link to={`/jobs/${job.id}/apply`} className="block w-full rounded-lg bg-[#11167b] px-4 py-3 text-center text-sm font-medium text-white hover:bg-[#181e96]">Apply Now →</Link> : <button disabled className="w-full rounded-lg bg-gray-300 px-4 py-3 text-sm font-medium text-gray-600">Applications Closed</button>}
            <button disabled={saving} onClick={toggleSaved} className="mt-4 w-full py-2 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50">{saved ? '♥ Saved' : '♡ Save Job'}</button>
            <button className="w-full py-2 text-xs text-gray-600 hover:text-gray-900">◈ Report the listing</button>
            {notice && <p role="status" className="mt-2 text-center text-xs text-green-700">{notice}</p>}
          </section>

          <OrganisationCard organisation={organisation} />

          <section className="mt-4 rounded-xl border border-gray-200 bg-[#eef3fd] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#1e3714]">◉ Sanctuary Trust Guarantee</h3>
            <p className="mt-2 pl-5 text-xs leading-4 text-gray-600">Verified organisations and transparent role information help keep the community safe.</p>
            <p className="mt-3 text-right text-[10px] font-bold underline">Learn about safe opportunities →</p>
          </section>

          <div className="mt-7 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">Share this job:</span>
            <button onClick={share} className="rounded-full bg-[#dfe8f7] px-4 py-2 text-xs font-semibold hover:bg-[#d2def0]">Share / Copy Link</button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function JobSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-7"><h2 className="border-b border-gray-300 pb-1 font-serif text-2xl font-bold">{title}</h2><div className="mt-3">{children}</div></section>;
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-[15px] leading-5 text-gray-600"><span className="mt-0.5 text-gray-900">⊙</span><span>{item}</span></li>)}</ul>;
}

function MetaRow({ icon, value }: { icon: string; value: string }) {
  return <div className="flex items-start gap-3"><span>{icon}</span><span>{value}</span></div>;
}

function OrganisationCard({ organisation }: { organisation: JobDetailsData['jobListing'] extends infer _ ? NonNullable<JobDetailsData['jobListing']>['organisation'] : never }) {
  return <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ede5db] font-serif text-xl font-bold">{organisation.logoUrl ? <img src={organisation.logoUrl} alt="" className="h-full w-full object-cover" /> : organisation.name.charAt(0)}</div><div className="min-w-0 flex-1"><h3 className="font-serif text-lg font-bold leading-tight">{organisation.name}</h3>{organisation.region && <p className="text-xs text-gray-500">{organisation.region}</p>}</div><Link to={`/organisations/${organisation.id}`} className="rounded-full border px-3 py-1.5 text-[10px] hover:bg-gray-50">View Profile →</Link></div>{organisation.description && <p className="mt-4 text-xs leading-5 text-gray-500">“{organisation.description}”</p>}<div className="mt-4 flex gap-5 text-[10px] text-gray-600"><span>◉ {organisation.verificationTier === 'CHARITY' ? 'Registered Charity' : 'Community Organisation'}</span>{organisation.isVerified && <span>✓ Verified Poster</span>}</div></section>;
}

function PageMessage({ title, detail }: { title: string; detail?: string }) {
  return <main className="flex min-h-[65vh] items-center justify-center bg-[#fbfbfa] px-6 text-center"><div><h1 className="font-serif text-3xl font-bold">{title}</h1>{detail && <p className="mt-3 text-sm text-gray-500">{detail}</p>}<Link to="/jobs" className="mt-6 inline-block rounded-full bg-[#11167b] px-5 py-2.5 text-sm text-white">Browse jobs</Link></div></main>;
}
