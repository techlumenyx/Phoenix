import React, { useState } from 'react';

export default function OrgJobsPage() {
  const [activeTab, setActiveTab] = useState('Applications');
  const tabs = ['Active Listings', 'Draft Listings', 'Applications'];

  const candidateData = [
    {
      id: 1,
      name: 'Samuel L. Jackson',
      email: 'samljackson@gmail.com',
      appliedFor: 'Admin Manager',
      date: '26/03/25',
      experience: '3.5 Years',
      status: 'Under Review',
      statusTheme: 'bg-gray-100 text-gray-700',
    },
    {
      id: 2,
      name: 'Samuel L. Jackson',
      email: 'samljackson@gmail.com',
      appliedFor: 'Admin Manager',
      date: '26/03/25',
      experience: '3.5 Years',
      status: 'Under Review',
      statusTheme: 'bg-gray-100 text-gray-700',
    },
    {
      id: 3,
      name: 'Samuel L. Jackson',
      email: 'samljackson@gmail.com',
      appliedFor: 'Admin Manager',
      date: '26/03/25',
      experience: '3.5 Years',
      status: 'Shortlisted',
      statusTheme: 'bg-[#A7D7B9] text-gray-800',
    },
    {
      id: 4,
      name: 'Samuel L. Jackson',
      email: 'samljackson@gmail.com',
      appliedFor: 'Admin Manager',
      date: '26/03/25',
      experience: '3.5 Years',
      status: 'Hired',
      statusTheme: 'bg-[#B3C6FF] text-gray-800',
    },
    {
      id: 5,
      name: 'Samuel L. Jackson',
      email: 'samljackson@gmail.com',
      appliedFor: 'Admin Manager',
      date: '26/03/25',
      experience: '3.5 Years',
      status: 'Rejected',
      statusTheme: 'bg-[#F9C9C9] text-gray-800',
    },
  ];

  return (
    <div className="font-sans w-full max-w-[1200px] mx-auto p-6">
      
      {/* Page Title */}
      <h1 className="text-3xl font-serif font-bold text-[#1B1B1B] mb-6">
        Hiring & Jobs
      </h1>

      {/* Main Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        
        {/* Tabs Section */}
        <div className="px-6 pt-4 flex items-center gap-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[14px] font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-[#1B1B1B]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#1B1B1B]" />
              )}
            </button>
          ))}
        </div>

        {/* Toolbar Section */}
        <div className="p-6 flex flex-col gap-4">
          
          {/* Top Row Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-[#EAF0FC] text-gray-600 px-4 py-2 rounded-md text-[13px] font-medium hover:bg-blue-100 transition-colors">
                <div className="w-3.5 h-3.5 border border-gray-400 bg-white rounded-[2px]" />
                Select All
              </button>
              <button className="flex items-center gap-2 bg-[#EAF0FC] text-gray-600 px-4 py-2 rounded-md text-[13px] font-medium hover:bg-blue-100 transition-colors">
                Actions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <button className="flex items-center gap-2 bg-[#EAF0FC] text-gray-600 px-4 py-2 rounded-md text-[13px] font-medium hover:bg-blue-100 transition-colors w-40 justify-between">
                All Positions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="relative w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-[13px] text-gray-700 outline-none focus:border-gray-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button className="bg-[#143468] text-white px-5 py-1.5 rounded-full text-[13px] font-medium">
                All Statuses
              </button>
              {['Unread', 'Shortlisted', 'Interviewing'].map(status => (
                <button key={status} className="bg-[#EAF0FC] text-gray-600 px-5 py-1.5 rounded-full text-[13px] font-medium hover:bg-blue-100 transition-colors">
                  {status}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 bg-[#EAF0FC] text-gray-600 px-5 py-2 rounded-md text-[13px] font-medium hover:bg-blue-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
          
        </div>

        {/* Table Header */}
        <div className="bg-[#FAF6ED] px-6 py-4 border-b border-gray-200 border-t grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-4 text-[11px] font-bold text-gray-500 tracking-wider uppercase">
          <div>Candidate Name</div>
          <div>Applied For</div>
          <div>Apl. Date</div>
          <div>Experience</div>
          <div>Resume</div>
          <div>CV</div>
          <div>Offers</div>
          <div className="w-6"></div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {candidateData.map((item, index) => (
            <div
              key={item.id}
              className={`px-6 py-4 grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-4 items-center ${
                index !== candidateData.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* Name Column */}
              <div>
                <h4 className="font-bold text-[#1B1B1B] text-[14px]">
                  {item.name}
                </h4>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {item.email}
                </p>
              </div>

              {/* Applied For */}
              <div className="text-[13px] text-gray-500">
                {item.appliedFor}
              </div>

              {/* Date */}
              <div className="text-[13px] text-gray-500">
                {item.date}
              </div>

              {/* Experience */}
              <div className="text-[13px] text-gray-500">
                {item.experience}
              </div>

              {/* Resume Link */}
              <div>
                <a href="#" className="text-[13px] text-gray-500 underline decoration-gray-400 underline-offset-2 hover:text-gray-800 transition-colors">
                  View Resume
                </a>
              </div>

              {/* CV Link */}
              <div>
                <a href="#" className="text-[13px] text-gray-500 underline decoration-gray-400 underline-offset-2 hover:text-gray-800 transition-colors">
                  View CV
                </a>
              </div>

              {/* Offers / Status Dropdown */}
              <div>
                <button className={`flex items-center justify-between w-full max-w-[140px] px-3 py-1.5 rounded-full text-[12px] font-medium ${item.statusTheme}`}>
                  {item.status}
                  <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Actions Icon */}
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}