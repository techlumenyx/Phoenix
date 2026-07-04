import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../layout/icons';
import JobCard from '../cards/JobCard';

const TABS = ['Trending', 'Newly Added', 'Theology', 'Music', 'Worship', 'Movies / Films'] as const;

export default function FeaturedJobsSection() {
  const [activeTab, setActiveTab] = useState('Trending');

  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16 border-t border-gray-50">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">Featured Jobs</h2>
        <Link
          to="/jobs"
          className="font-display text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark transition-colors flex items-center gap-1 shrink-0 mb-1"
        >
          VIEW ALL JOBS
          <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-dark text-white'
                : 'bg-gray-100 text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards — 4-up */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shrink-0 w-[75vw] sm:w-[48vw] md:w-auto">
            <JobCard
              badge="JOB LISTING"
              badgeColor="blue"
              title="Project Coordinator"
              company="Grace Town Ministries"
              salaryRange="40k – 85k NGN"
              employmentType="Full Time Employment"
              location="Lagos City, Nigeria"
              verified
            />
          </div>
        ))}
      </div>
    </section>
  );
}
