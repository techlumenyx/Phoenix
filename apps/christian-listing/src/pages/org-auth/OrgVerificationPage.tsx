import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import SceneHeader from '../../components/layout/SceneHeader';
import { getAuth } from 'firebase/auth';
import { useAuthStore } from '../../store/authStore';

const CREATE_ORGANISATION = gql`
  mutation CreateOrganisation($input: CreateOrganisationInput!) {
    createOrganisation(input: $input) {
      id
      name
    }
  }
`;

const SUBMIT_VERIFICATION = gql`
  mutation SubmitVerification($organisationId: ID!, $documentUrls: [String!]!) {
    submitVerification(organisationId: $organisationId, documentUrls: $documentUrls) {
      id
      status
    }
  }
`;

const INPUT =
  'w-full bg-[#ede9e4] rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#C9A96E] transition';

interface IdentityState {
  orgName?: string;
  orgType?: string;
  missionStatement?: string;
}

export default function OrgVerificationPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const identity  = (location.state ?? {}) as IdentityState;

  const [regNumber, setRegNumber]     = useState('');
  const [officialName, setOfficialName] = useState('');
  const [poc, setPoc]                 = useState('');
  const [pocTitle, setPocTitle]       = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [docFile, setDocFile]         = useState<File | null>(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [createOrg]          = useMutation(CREATE_ORGANISATION);
  const [submitVerification] = useMutation(SUBMIT_VERIFICATION);

  async function submit(skip = false) {
    setError('');
    setLoading(true);
    try {
      const { data } = await createOrg({
        variables: {
          input: {
            name: identity.orgName || 'My Organisation',
            description: identity.missionStatement || '',
            region: 'GLOBAL',
          },
        },
      });

      if (!skip && regNumber) {
        await submitVerification({
          variables: {
            organisationId: data.createOrganisation.id,
            documentUrls: [],
          },
        });
      }

      await getAuth().currentUser?.getIdToken(true);
      useAuthStore.setState({ accountType: 'organisation' });

      navigate('/org/onboarding/success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <SceneHeader onClose={() => navigate('/')} />

        <div className="px-8 pb-8 pt-5">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-2xl font-serif font-bold text-[#1a1007]">Verification & Trust</h1>
            <span className="text-xs text-gray-400 whitespace-nowrap mt-1.5">Step 3 of 3</span>
          </div>
          <p className="text-xs text-gray-500 mb-1">
            To maintain a secure community, we verify all organizations. This process typically takes 24–48 hours.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            In order to create posts and increase visibility of your listings, a verification is mandatory. Verification helps you achieve better user engagement and is used to boost your visibility in the feed.
          </p>

          {error && (
            <p className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Organization Registration Number <span className="text-[#C9A96E]">◆</span>
              </label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="eg. 12344ABC"
                className={INPUT}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">
                Official Organization Name <span className="text-[#C9A96E]">◆</span>
              </label>
              <input
                type="text"
                value={officialName}
                onChange={(e) => setOfficialName(e.target.value)}
                placeholder="Full Legal Name"
                className={INPUT}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Authorized Contact Person (POC)</label>
              <input
                type="text"
                value={poc}
                onChange={(e) => setPoc(e.target.value)}
                placeholder="Full Legal Name"
                className={INPUT}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Authorized POC Job Title</label>
              <input
                type="text"
                value={pocTitle}
                onChange={(e) => setPocTitle(e.target.value)}
                placeholder="eg. Director"
                className={INPUT}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Official Email Address</label>
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                placeholder="name@organization.com"
                className={INPUT}
              />
            </div>
          </div>

          {/* Document upload */}
          <div className="flex flex-col gap-2 mb-8">
            <label className="text-sm font-semibold text-gray-700">Verify Documents</label>
            <p className="text-xs text-gray-500">
              Please upload a copy of your Business License, Certificate of Incorporation, or similar document for us to verify your information with the local registries.
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors bg-[#faf9f7]"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">
                {docFile
                  ? docFile.name
                  : 'Click to upload files (PDF, DOCX, PNG, JPEG) · Max. 10 MB'}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => submit(true)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Skip for now →
            </button>
            <button
              onClick={() => submit(false)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#1a1007] text-white text-sm font-semibold hover:bg-[#2d1e0d] transition-colors disabled:opacity-40"
            >
              {loading ? 'Submitting…' : 'Complete Registration →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
