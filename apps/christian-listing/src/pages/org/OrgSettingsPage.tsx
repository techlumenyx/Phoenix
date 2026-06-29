import React, { useState, useEffect, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { MY_ORGANISATIONS, UPDATE_ORGANISATION } from '../../graphql/mutations';

interface OrgData {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  websiteUrl: string | null;
  socialLinks: {
    whatsapp?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    website?: string | null;
  } | null;
}

export default function OrgSettingsPage() {
  const { data } = useQuery(MY_ORGANISATIONS);
  const org: OrgData | null = data?.myOrganisations?.[0] ?? null;

  const [name, setName]           = useState('');
  const [region, setRegion]       = useState('');
  const [description, setDesc]    = useState('');
  const [websiteUrl, setWebsite]  = useState('');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (org) {
      setName(org.name ?? '');
      setRegion(org.region ?? '');
      setDesc(org.description ?? '');
      setWebsite(org.websiteUrl ?? '');
    }
  }, [org]);

  const [updateOrg] = useMutation(UPDATE_ORGANISATION, {
    refetchQueries: [{ query: MY_ORGANISATIONS }],
  });

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    if (!org) return;
    setSaveError(''); setSaving(true); setSaved(false);
    try {
      await updateOrg({
        variables: {
          id: org.id,
          input: {
            name:        name.trim() || undefined,
            description: description.trim() || undefined,
            region:      region.trim() || undefined,
            websiteUrl:  websiteUrl.trim() || undefined,
          },
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="font-sans w-full max-w-5xl mx-auto p-6 text-[#1B1B1B]">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-serif font-bold">Settings</h1>
      </div>

      {/* 1. Profile Details */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Profile Details</h2>
        </div>
        <form onSubmit={handleUpdateProfile}>
          <div className="p-6 flex flex-col md:flex-row gap-8">
            {/* Avatar Side */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-28 h-28 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                <div className="w-full h-full flex items-center justify-center bg-[#EAEAF5] text-[#1B1B1B] text-3xl font-bold">
                  {(org?.name ?? 'O').charAt(0).toUpperCase()}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Logo upload coming soon</p>
            </div>

            {/* Form Side */}
            <div className="flex-1 space-y-5">
              {saveError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-4 py-2.5">{saveError}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-[#C9A96E]/40"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold mb-1.5">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-[#C9A96E]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold mb-1.5">About Us</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-[#F4F0F5] text-gray-600 text-[12px] leading-relaxed px-4 py-3 rounded-md outline-none resize-none focus:ring-2 focus:ring-[#C9A96E]/40"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold mb-1.5">Website URL</label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourorg.com"
                  className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none focus:ring-2 focus:ring-[#C9A96E]/40"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
                <button
                  type="submit"
                  disabled={saving || !org}
                  className="bg-[#302D2E] text-white px-5 py-2 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </form>
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
              <input type="text" readOnly defaultValue="—" className="w-full bg-[#F4F0F5] text-gray-500 text-[13px] px-4 py-2.5 rounded-md outline-none" />
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

        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-11 h-11 rounded-full bg-[#FAF6ED] flex items-center justify-center">
            <svg className="w-5 h-5 text-[#C9A96E]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700">Team management coming soon</p>
          <p className="text-xs text-gray-400">Invite members and assign roles in a future update.</p>
        </div>
      </section>

      {/* 4. Site Preferences & Personalization */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-bold">Site Preferences & Personalization</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-5">
            {[{ label: 'Region', value: 'Lagos, Nigeria' }, { label: 'Currency', value: 'USD $ - US Dollar' }, { label: 'Time Zone', value: '(GMT +00:00) UTC' }].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-[13px] font-bold mb-1.5">{label}</label>
                <div className="relative">
                  <select className="w-full bg-[#F4F0F5] text-gray-700 text-[13px] px-4 py-2.5 rounded-md outline-none appearance-none cursor-pointer">
                    <option>{value}</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-[14px] font-bold mb-3">Enable Email Notifications</h3>
            <div className="space-y-2.5">
              {['Messaging & Chat', 'Events & RSVP', 'Job Board Alerts', 'Market Place Offers'].map((label) => (
                <div key={label} className="flex items-center justify-between bg-[#F4F0F5] px-4 py-2.5 rounded-md">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-[13px] text-gray-700 font-medium">{label}</span>
                  </div>
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
          {['Community Guidelines', 'Privacy Policy', 'Terms of Service'].map((label) => (
            <button key={label} className="w-full flex items-center justify-between bg-[#F4F0F5] px-5 py-3.5 rounded-md hover:bg-[#EAE5EC] transition-colors text-left">
              <span className="text-[13px] font-bold text-gray-800">{label}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
