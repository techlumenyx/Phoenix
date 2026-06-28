import React, { useState } from 'react';

export default function OrgEventsPage() {
  const [activeTab, setActiveTab] = useState('Active Events');
  const tabs = ['Active Events', 'Draft Events', 'Recurring Events'];

  // Mock data to match the 8 rows in the image
  const eventsData = Array(8).fill({
    id: crypto.randomUUID(),
    titleLine1: 'Upskill Workshop',
    titleLine2: 'For New Grads',
    location: 'Lagos (Hybrid)',
    type: 'Study / Worship',
    frequency: 'Recurring',
    date: '26/03/25',
    views: '1.2k views',
    capacity: '450 PAX',
    rsvpsCount: '24',
    rsvpsLabel: 'RSVPs',
  });

  return (
    <div className="font-sans w-full max-w-7xl mx-auto p-6">
      
      {/* Page Title */}
      <h1 className="text-3xl font-serif font-bold text-[#1B1B1B] mb-6">
        Events Manager
      </h1>

      {/* Main Content Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        
        {/* Tabs Section */}
        <div className="px-6 pt-4 flex items-center gap-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium transition-colors relative ${
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

        {/* Table Header */}
        <div className="bg-[#FAF6ED] px-6 py-4 border-b border-gray-200 grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 text-[11px] font-bold text-gray-500 tracking-wider uppercase">
          <div>Listing Details</div>
          <div>Type</div>
          <div>Frequency</div>
          <div>Date</div>
          <div>Views</div>
          <div>Capacity</div>
          <div>RSVPs</div>
          <div className="w-6"></div> {/* Spacer for 3-dots menu */}
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {eventsData.map((item, index) => (
            <div
              key={index}
              className={`px-6 py-4 grid grid-cols-[2.5fr_1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center ${
                index !== eventsData.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* Details Column */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#EAEAF5] flex items-center justify-center shrink-0 text-[#1B1B1B]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-[#1B1B1B] text-[14px] leading-snug">
                    {item.titleLine1}<br />
                    {item.titleLine2}
                  </h4>
                  <p className="text-[12px] text-gray-500 mt-1">
                    {item.location}
                  </p>
                </div>
              </div>

              {/* Type Column */}
              <div className="text-[13px] text-gray-500">
                {item.type}
              </div>

              {/* Frequency Column */}
              <div className="text-[13px] text-gray-500">
                {item.frequency}
              </div>

              {/* Date Column */}
              <div className="text-[13px] text-gray-500">
                {item.date}
              </div>

              {/* Views Column */}
              <div className="flex items-center gap-1.5 text-gray-500 text-[13px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {item.views}
              </div>

              {/* Capacity Column */}
              <div className="text-[13px] text-gray-500">
                {item.capacity}
              </div>

              {/* RSVPs Column */}
              <div className="text-[13px] text-gray-500">
                <strong className="text-[#1B1B1B] font-bold">{item.rsvpsCount}</strong> {item.rsvpsLabel}
              </div>

              {/* Actions Column */}
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