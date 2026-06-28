import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useAuthStore } from '../../store/authStore';
import SceneHeader from '../../components/layout/SceneHeader';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      preferences
      onboardingCompleted
    }
  }
`;

const INTERESTS = [
  { label: 'Worship',     img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&q=70' },
  { label: 'Bible Study', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70' },
  { label: 'Jobs',        img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&q=70' },
  { label: 'Events',      img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&q=70' },
  { label: 'Marketplace', img: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=70' },
  { label: 'Community',   img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&q=70' },
  { label: 'Music',       img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=70' },
  { label: 'Prayer',      img: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=300&q=70' },
];

export default function OnboardingPreferencesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  function toggle(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  async function handleFinish(skip = false) {
    try {
      const { data } = await updateProfile({
        variables: {
          input: {
            preferences: skip ? [] : Array.from(selected),
            onboardingCompleted: true,
          },
        },
      });
      useAuthStore.setState((s) => ({
        dbUser: s.dbUser ? { ...s.dbUser, ...data.updateProfile } : s.dbUser,
      }));
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <SceneHeader onClose={() => navigate('/')} />
        <div className="px-7 pb-7 pt-5">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-serif font-bold text-[#1B1B1B]">What moves your heart?</h1>
          <span className="text-xs text-gray-400 whitespace-nowrap mt-1.5">Step 3 of 3</span>
        </div>
        <p className="text-xs text-gray-500 mb-5">Select at least 3 interests to help us tailor your experience</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {INTERESTS.map((item) => {
            const active = selected.has(item.label);
            return (
              <button
                key={item.label}
                onClick={() => toggle(item.label)}
                className={`relative rounded-2xl overflow-hidden aspect-square transition-all ${
                  active ? 'ring-2 ring-[#C9A96E]' : 'ring-1 ring-transparent'
                }`}
              >
                <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 transition-colors ${active ? 'bg-black/20' : 'bg-black/40'}`} />
                {active && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C9A96E] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <span className="absolute bottom-2 left-0 right-0 text-center text-white text-xs font-semibold">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => handleFinish(true)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Skip for Now +
          </button>
          <button
            onClick={() => handleFinish(false)}
            disabled={selected.size < 3 || loading}
            className="flex-1 py-2.5 rounded-xl bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-40"
          >
            {loading ? 'Saving…' : 'Start your Journey →'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
