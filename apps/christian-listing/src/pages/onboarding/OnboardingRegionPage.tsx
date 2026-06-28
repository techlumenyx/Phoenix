import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import SceneHeader from '../../components/layout/SceneHeader';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      region
    }
  }
`;

const SUGGESTED_REGIONS = [
  { label: 'London, UK',       sub: 'Europe · GBP (£)',          value: 'GB-LDN' },
  { label: 'New York, USA',    sub: 'North America · USD ($)',    value: 'US-NYC' },
  { label: 'Lagos, Nigeria',   sub: 'Africa · NGN (₦)',           value: 'NG-LAG' },
  { label: 'Nairobi, Kenya',   sub: 'Africa · KES (KSh)',         value: 'KE-NBI' },
  { label: 'Toronto, Canada',  sub: 'North America · CAD ($)',    value: 'CA-TOR' },
  { label: 'Accra, Ghana',     sub: 'Africa · GHS (₵)',           value: 'GH-ACC' },
];

export default function OnboardingRegionPage() {
  const navigate = useNavigate();
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  const filtered = SUGGESTED_REGIONS.filter(
    (r) =>
      search === '' ||
      r.label.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleNext() {
    if (!selected) return;
    try {
      await updateProfile({ variables: { input: { region: selected } } });
      navigate('/onboarding/preferences');
    } catch (err) {
      console.error('Failed to save region', err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <SceneHeader onClose={() => navigate('/')} />
        <div className="px-7 pb-7 pt-5">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-2xl font-serif font-bold text-[#1B1B1B]">Set Your Home Region</h1>
            <span className="text-xs text-gray-400 whitespace-nowrap mt-1.5">Step 2 of 3</span>
          </div>
          <p className="text-xs text-gray-500 mb-5">Personalize your feed and currency</p>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Cities or Countries......"
              className="w-full bg-[#F5F0EB] rounded-xl pl-9 pr-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#C9A96E]"
            />
          </div>

          <p className="text-xs font-semibold text-gray-500 mb-2">Suggested Regions</p>
          <div className="flex flex-col gap-2 mb-6 max-h-64 overflow-y-auto">
            {filtered.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelected(r.value)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-colors ${
                  selected === r.value
                    ? 'bg-[#1B1B1B] text-white'
                    : 'bg-[#F5F0EB] text-[#1B1B1B] hover:bg-[#ece6df]'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${selected === r.value ? 'bg-white/20' : 'bg-[#C9A96E]/20'}`}>
                  🗺
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate">{r.label}</span>
                  <span className={`block text-xs ${selected === r.value ? 'text-white/70' : 'text-gray-500'}`}>{r.sub}</span>
                </span>
                <svg className="w-4 h-4 flex-shrink-0 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selected || loading}
              className="flex-1 py-2.5 rounded-xl bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-40"
            >
              {loading ? 'Saving…' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
