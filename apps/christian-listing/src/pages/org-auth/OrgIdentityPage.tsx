import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SceneHeader from '../../components/layout/SceneHeader';

const ORG_TYPES = ['Church', 'Charity', 'NGO', 'Ministry', 'Fellowship', 'Mission Organisation', 'Christian School', 'Other'];

const INPUT =
  'w-full bg-[#ede9e4] rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#C9A96E] transition';

export default function OrgIdentityPage() {
  const navigate = useNavigate();

  const [orgName, setOrgName]           = useState('');
  const [orgType, setOrgType]           = useState('');
  const [missionStatement, setMission]  = useState('');

  function goToVerification(skip = false) {
    navigate('/org/onboarding/verification', {
      state: skip ? {} : { orgName, orgType, missionStatement },
    });
  }

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <SceneHeader onClose={() => navigate('/')} />

        <div className="px-7 pb-7 pt-5">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-2xl font-serif font-bold text-[#1a1007]">Mission & Identity</h1>
            <span className="text-xs text-gray-400 whitespace-nowrap mt-1.5">Step 2 of 3</span>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Define the essence of your organization to begin your journey in our community
          </p>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="eg. The Church of Yorkshire..."
                className={INPUT}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Organization Type</label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className={INPUT}
              >
                <option value="">eg. Charity</option>
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Mission Statement</label>
              <textarea
                value={missionStatement}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Briefly describe your organization's purpose and the impact you seek to make..."
                rows={4}
                className={`${INPUT} resize-none`}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => goToVerification(true)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => goToVerification(false)}
              className="flex-1 py-2.5 rounded-xl bg-[#1a1007] text-white text-sm font-semibold hover:bg-[#2d1e0d] transition-colors"
            >
              Next Step →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
