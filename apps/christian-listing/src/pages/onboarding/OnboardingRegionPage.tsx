import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import SceneHeader from '../../components/layout/SceneHeader';
import LocationCombobox, { type CanonicalLocation } from '../../components/location/LocationCombobox';
import { useAuthStore, type DbUser } from '../../store/authStore';

const UPDATE_PROFILE = gql`
  mutation UpdateRegionProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      avatarUrl
      isVerified
      onboardingCompleted
      region
      regionCode
      preferences
      roles
      orgId
    }
  }
`;

export default function OnboardingRegionPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CanonicalLocation | null>(null);
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE);

  async function handleNext() {
    if (!selected) return;
    try {
      const result = await updateProfile({
        variables: { input: { region: selected.displayName, regionCode: selected.id } },
      });
      if (result.data?.updateProfile) {
        useAuthStore.setState({ dbUser: result.data.updateProfile as DbUser });
      }
      navigate('/onboarding/preferences');
    } catch (error) {
      console.error('Failed to save region', error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-10 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-visible rounded-3xl bg-white shadow-xl">
        <div className="overflow-hidden rounded-t-3xl">
          <SceneHeader onClose={() => navigate('/')} />
        </div>
        <div className="px-7 pb-7 pt-5">
          <div className="mb-1 flex items-start justify-between">
            <h1 className="font-serif text-2xl font-bold text-[#1B1B1B]">Set Your Home Region</h1>
            <span className="mt-1.5 whitespace-nowrap text-xs text-gray-400">Step 2 of 3</span>
          </div>
          <p className="mb-5 text-xs text-gray-500">Personalise nearby events, jobs, and listings</p>

          <p className="mb-2 text-xs font-semibold text-gray-500">Your city</p>
          <LocationCombobox
            value={selected}
            onChange={setSelected}
            placeholder="Start typing a city name"
            autoFocus
            className="mb-3"
          />
          <p className="mb-6 text-xs text-gray-500">
            Choose a suggestion so locations remain consistent, even when cities share a name.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!selected || loading}
              className="flex-1 rounded-xl bg-[#1B1B1B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:opacity-40"
            >
              {loading ? 'Saving…' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
