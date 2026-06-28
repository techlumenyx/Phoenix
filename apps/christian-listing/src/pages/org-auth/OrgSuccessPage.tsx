import { useNavigate } from 'react-router-dom';
import SceneHeader from '../../components/layout/SceneHeader';

const FEATURES = [
  'Create Paid & Free events on the portal - manage RSVP end-to-end',
  'Verified Badge on all your listings and priority to your listings',
  'Manage hiring & recruitment end-to-end from listing to applications',
  'Create unlimited listings for sale and charity, without hassle',
];

export default function OrgSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <SceneHeader onClose={() => navigate('/')} />

        <div className="px-7 pb-8 pt-6">
          <h1 className="text-xl font-serif font-bold text-[#1a1007] mb-2">
            Your verification request has been registered!
          </h1>
          <p className="text-xs text-gray-500 mb-1">
            You will shortly hear back from us about the status of your verification.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Complete your profile to engage better with the community.
          </p>

          <div className="mb-7">
            <p className="text-sm font-semibold text-[#1a1007] mb-3">Features that Organizations get</p>
            <ul className="flex flex-col gap-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-[#C9A96E] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl bg-[#1a1007] text-white text-sm font-semibold hover:bg-[#2d1e0d] transition-colors"
          >
            Continue to the site →
          </button>
        </div>
      </div>
    </div>
  );
}
