import React from 'react';

export default function OrgSettingsPage() {
  const teamMembers = [
    { id: 1, name: 'Samuel L. Jackson', email: 'samljackson@gmail.com', role: 'ADMIN', status: 'ACTIVE', link: 'download_grace@gmail.com' },
    { id: 2, name: 'Samuel L. Jackson', email: 'samljackson@gmail.com', role: 'ADMIN', status: 'ACTIVE', link: 'download_grace@gmail.com' },
    { id: 3, name: 'Samuel L. Jackson', email: 'samljackson@gmail.com', role: 'EDITOR', status: 'ACTIVE', link: 'download_grace@gmail.com' },
    { id: 4, name: 'Samuel L. Jackson', email: 'samljackson@gmail.com', role: 'HIRING', status: 'ACTIVE', link: 'download_grace@gmail.com' },
    { id: 5, name: 'Samuel L. Jackson', email: 'samljackson@gmail.com', role: 'MARKETPLACE', status: 'ACTIVE', link: 'download_grace@gmail.com' },
  ];

  return (
    <div className="font-sans w-full max-w-5xl mx-auto p-6 text-[#1B1B1B]">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-serif font-bold">Settings</h1>
        <button className="bg-[#302D2E] text-white px-5 py-2.5 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors">
          Update Settings
        </button>
      </div>

      {/* 1. Profile Details */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Profile Details</h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row gap-8">
          {/* Avatar Side */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-28 h-28 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Última_Cena_-_Da_Vinci_5.jpg" alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute bottom-1 right-3 bg-black text-white p-1 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
            </div>
          </div>
          
          {/* Form Side */}
          <div className="flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold mb-1.5">Display Name</label>
                <input type="text" defaultValue="Grace Community" className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold mb-1.5">Region</label>
                <input type="text" defaultValue="Lagos, Nigeria" className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold mb-1.5">About Us</label>
              <textarea 
                rows={3}
                defaultValue="Questions that need additional work or that are not a good fit for this site may be closed by experienced community members. Closed questions cannot be answered, but can be edited to make them eligible for reopening. If your question is closed, you will receive private feedback on the reason why it was closed."
                className="w-full bg-[#F4F0F5] text-gray-600 text-[12px] leading-relaxed px-4 py-3 rounded-md outline-none resize-none" 
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold mb-2">Social Links</label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4].map(i => (
                  <button key={i} className="flex items-center gap-1.5 bg-[#F4F0F5] px-3 py-1.5 rounded-full text-[12px] font-medium text-gray-700 hover:bg-[#EAE5EC] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" /></svg>
                    @grace_community
                  </button>
                ))}
                <button className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 text-gray-500 rounded-full hover:bg-gray-50">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold mb-1.5">Website URL</label>
              <input type="text" defaultValue="www.gracecommunities.org.ng" className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none" />
            </div>

            <div className="flex justify-end pt-2">
              <button className="bg-[#302D2E] text-white px-5 py-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Account & Access */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Account & Access</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-[13px] font-bold mb-1.5">Email Address</label>
              <input type="text" readOnly defaultValue="Gracehub@gmail.com" className="w-full bg-[#F4F0F5] text-gray-500 text-[13px] px-4 py-2.5 rounded-md outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-1.5">Password</label>
              <button className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md flex items-center justify-between hover:bg-[#EAE5EC] transition-colors">
                Change Password
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-gray-100 pt-6 gap-4">
            <div>
              <h4 className="text-[13px] font-bold text-[#D32F2F]">Critical Actions</h4>
              <p className="text-[12px] text-gray-500 mt-0.5">These actions are permanent and cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2 border border-gray-300 rounded-md text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Deactivate
              </button>
              <button className="px-6 py-2 bg-[#C62828] text-white rounded-md text-[13px] font-medium hover:bg-red-800 transition-colors">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Team & Role Management */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Team & Role Management</h2>
        </div>
        
        {/* Table Header */}
        <div className="bg-[#FAF6ED] px-6 py-3 border-b border-gray-200 grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_auto] gap-4 text-[10px] font-bold text-gray-500 tracking-wider uppercase">
          <div>User Name</div>
          <div>Role</div>
          <div>Status</div>
          <div>User ID</div>
          <div>Activity</div>
          <div className="w-6">Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {teamMembers.map((member, index) => (
            <div key={member.id} className={`px-6 py-4 grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_auto] gap-4 items-center ${index !== teamMembers.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div>
                <h4 className="font-bold text-[13px]">{member.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{member.email}</p>
              </div>
              
              <div>
                <button className="bg-[#F4F0F5] text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center justify-between w-28 hover:bg-[#EAE5EC]">
                  {member.role}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              
              <div className="text-[12px] text-gray-500">
                {member.status}
              </div>
              
              <div>
                <a href="#" className="text-[12px] text-gray-500 underline decoration-gray-400 hover:text-gray-800">
                  {member.link}
                </a>
              </div>
              
              <div>
                <a href="#" className="text-[12px] text-gray-500 underline decoration-gray-400 hover:text-gray-800">
                  View Log
                </a>
              </div>
              
              <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button className="bg-[#302D2E] text-white px-5 py-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5">
            Invite Member +
          </button>
        </div>
      </section>

      {/* 4. Site Preferences & Personalization */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Site Preferences & Personalization</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Dropdowns */}
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold mb-1.5">Region</label>
              <div className="relative">
                <select className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none appearance-none cursor-pointer">
                  <option>London, Nigeria</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-[13px] font-bold mb-1.5">Currency</label>
              <div className="relative">
                <select className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none appearance-none cursor-pointer">
                  <option>USD $ - US Dollar</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold mb-1.5">Time Zone</label>
              <div className="relative">
                <select className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none appearance-none cursor-pointer">
                  <option>( GMT +00:00 ) US Pacific Time</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Toggles */}
          <div>
            <h3 className="text-[14px] font-bold mb-3">Enable Email Notifications</h3>
            <div className="space-y-2.5">
              {['Messaging & Chat', 'Events & RSVP', 'Job Board Alerts', 'Market Place Offers'].map((label, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F4F0F5] px-4 py-2.5 rounded-md">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-[13px] text-gray-700 font-medium">{label}</span>
                  </div>
                  {/* Custom Checkbox/Toggle Icon matching design */}
                  <div className="w-5 h-5 bg-[#302D2E] rounded-md flex items-center justify-center cursor-pointer">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Privacy & Security */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Privacy & Security</h2>
        </div>
        <div className="p-6 space-y-3">
          {['Community Guidelines', 'Privacy Policy', 'Terms of Service'].map((label, i) => (
            <button key={i} className="w-full flex items-center justify-between bg-[#F4F0F5] px-5 py-3.5 rounded-md hover:bg-[#EAE5EC] transition-colors text-left">
              <span className="text-[13px] font-bold text-gray-800">{label}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7-7" /></svg>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}