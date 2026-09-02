import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type GuideTab = 'user' | 'organization';

interface GuideSection {
  title: string;
  description: string;
  steps: string[];
}

const USER_GUIDE: GuideSection[] = [
  {
    title: 'Browsing & Searching',
    description: 'Find events, jobs, and marketplace listings from across the diaspora community.',
    steps: [
      'Use the search bar at the top of any page, or visit Events, Jobs, or Marketplace from the main navigation.',
      'Narrow results by region, category, or keyword using the filters on each listings page.',
      'Open "Browse Opportunities" from your Dashboard for a quick jump into job listings.',
    ],
  },
  {
    title: 'Applying to Jobs',
    description: 'Submit and track applications to job postings from verified organizations.',
    steps: [
      'Open a job listing and click "Apply" to start your application.',
      'Fill in the required details and submit — the organization is notified immediately.',
      'Track the status of every application under Dashboard → My Applications.',
    ],
  },
  {
    title: 'Saving & Following',
    description: 'Keep track of listings and organizations you care about.',
    steps: [
      'Tap the heart icon on any event, job, or marketplace listing to save it for later.',
      'Follow an organization from its profile page to get updates on what they post.',
      'Review everything you\'ve saved or followed under Dashboard → Saved Items and Dashboard → Following.',
    ],
  },
  {
    title: 'Messaging',
    description: 'Message organizations directly about a listing, job, or event.',
    steps: [
      'Click "Message" on a listing, job, or organization profile to start a conversation.',
      'View and reply to all your conversations under Dashboard → Messages.',
      'Replies from organizations show up in the same thread, with unread counts on your Dashboard.',
    ],
  },
  {
    title: 'Managing Your Profile',
    description: 'Keep your account details current.',
    steps: [
      'Open My Profile from your Dashboard, or the account menu in the top navigation.',
      'Update your display name, contact details, and preferences, then save your changes.',
    ],
  },
  {
    title: 'Reporting a Conversation',
    description: 'Flag inappropriate or concerning messages from a listing or organization.',
    steps: [
      'From within a message thread, use the report option to flag the conversation.',
      'Describe the issue — our team reviews every report.',
      'Track the status of reports you\'ve filed under Dashboard → My Reports.',
    ],
  },
];

const ORG_GUIDE: GuideSection[] = [
  {
    title: 'Getting Started as an Organization',
    description: 'Set up your organization account and get verified.',
    steps: [
      'Sign up as an organization and complete the identity and verification steps.',
      'Once approved, fill out your organization profile — logo, description, region, and social links — from the Overview tab.',
      'Your org dashboard is available at /org and replaces the individual dashboard for your account.',
    ],
  },
  {
    title: 'Posting & Managing Events',
    description: 'Create, edit, and promote events from the Events Manager.',
    steps: [
      'Open Events Manager and click to create a new event — add details, dates, and media.',
      'Edit or cancel an existing event any time from the same list.',
      'Upgrade to a paid plan to promote an event beyond your local region.',
    ],
  },
  {
    title: 'Posting & Managing Listings',
    description: 'List marketplace items for your community.',
    steps: [
      'Open Listings Manager and create a new listing with photos and a description.',
      'Edit or remove listings as availability changes.',
    ],
  },
  {
    title: 'Hiring & Job Postings',
    description: 'Post openings and manage applicants.',
    steps: [
      'Open Hiring & Jobs and create a new job posting with role details and requirements.',
      'Review incoming applications and update a posting\'s status as it fills.',
    ],
  },
  {
    title: 'Messaging & Team Roles',
    description: 'Handle inbound messages and manage who on your team has access.',
    steps: [
      'Respond to messages about your events, listings, and jobs under Messages — unread counts show in the sidebar.',
      'Invite teammates and assign roles under Team & Roles so others can help manage the account.',
      'Use Report Communications to review any conversations that have been flagged.',
    ],
  },
  {
    title: 'Settings & Analytics',
    description: 'Configure your organization and track performance.',
    steps: [
      'Update organization-wide settings under Settings (visible to team members with permission).',
      'Check Analytics for a summary of views, applications, and engagement across your posts.',
    ],
  },
];

function GuideAccordionItem({ title, description, steps }: GuideSection) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-gray-800">{title}</span>
        <span
          className="shrink-0 w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-lg leading-none transition-transform"
          style={{ transform: open ? 'rotate(45deg)' : '' }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-10">
          <p className="text-sm text-gray-500 mb-3">{description}</p>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function GuidePage({ defaultTab, embedded = false }: { defaultTab: GuideTab; embedded?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const activeTab: GuideTab = paramTab === 'user' || paramTab === 'organization' ? paramTab : defaultTab;

  function selectTab(tab: GuideTab) {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  }

  const sections = activeTab === 'user' ? USER_GUIDE : ORG_GUIDE;

  return (
    <main className={embedded ? 'min-h-screen bg-[#FAF4F0] px-6 py-8' : 'min-h-screen bg-[#FAF8F3] px-5 pb-20 pt-28'}>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9A7744]">Help Center</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-gray-900">User Guide</h1>
        <p className="mt-3 text-gray-600">Step-by-step walkthroughs for getting the most out of Christian Listings.</p>

        <div className="mt-8 inline-flex rounded-full border border-gray-200 bg-white p-1">
          {(['user', 'organization'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => selectTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                activeTab === tab ? 'bg-[#1B1B1B] text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'user' ? 'User' : 'Organization'}
            </button>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl px-6 shadow-sm border border-gray-100">
          {sections.map((section) => (
            <GuideAccordionItem key={section.title} {...section} />
          ))}
        </div>
      </div>
    </main>
  );
}
