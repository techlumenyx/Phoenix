import { FormEvent, useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/ToastProvider';
import DirectoryState from '../components/ui/DirectoryState';

const PROFILE = gql`
  query EditableMemberProfile {
    me {
      id name email region bio avatarUrl preferences
      socialLinks { whatsapp instagram facebook twitter website }
      privacySettings { profileVisibility showAvatar showRegion showBio showSocialLinks }
    }
  }
`;
const UPDATE_PROFILE = gql`
  mutation EditMemberProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id name email region bio avatarUrl preferences
      socialLinks { whatsapp instagram facebook twitter website }
      privacySettings { profileVisibility showAvatar showRegion showBio showSocialLinks }
    }
  }
`;

const INTERESTS = [
  'Worship & Services', 'Community & Social', 'Charity & Welfare',
  'Youth & Young Adults', 'Conferences & Seminars', 'Career & Volunteering',
  'Marketplace Deals', 'Music & Creative Arts',
];

type ProfileVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  showAvatar: boolean;
  showRegion: boolean;
  showBio: boolean;
  showSocialLinks: boolean;
}
interface ProfileData {
  me: {
    id: string; name: string; email: string; region: string; bio?: string | null;
    avatarUrl?: string | null; preferences: string[];
    socialLinks?: Record<string, string | null> | null;
    privacySettings: PrivacySettings;
  } | null;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'MEMBERS_ONLY',
  showAvatar: true,
  showRegion: true,
  showBio: true,
  showSocialLinks: false,
};
const fieldClass = 'mt-2 w-full rounded-xl bg-[#F4F0F5] px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#C9A96E]/40';

const VISIBILITY_OPTIONS: Array<{ value: ProfileVisibility; title: string; detail: string }> = [
  { value: 'PUBLIC', title: 'Public', detail: 'Anyone browsing Christian Listings can see the details you allow below.' },
  { value: 'MEMBERS_ONLY', title: 'Members only', detail: 'Only signed-in Christian Listings members can see the details you allow.' },
  { value: 'PRIVATE', title: 'Only me', detail: 'Hide extended profile details from everyone else.' },
];

export default function ProfilePage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data, loading, error, refetch } = useQuery<ProfileData>(PROFILE);
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreviewFailed, setAvatarPreviewFailed] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [social, setSocial] = useState({ whatsapp: '', instagram: '', facebook: '', twitter: '', website: '' });

  useEffect(() => {
    if (!data?.me) return;
    setName(data.me.name);
    setRegion(data.me.region ?? '');
    setBio(data.me.bio ?? '');
    setAvatarUrl(data.me.avatarUrl ?? '');
    setPreferences(data.me.preferences ?? []);
    setPrivacy(data.me.privacySettings ?? DEFAULT_PRIVACY);
    setSocial({
      whatsapp: data.me.socialLinks?.whatsapp ?? '',
      instagram: data.me.socialLinks?.instagram ?? '',
      facebook: data.me.socialLinks?.facebook ?? '',
      twitter: data.me.socialLinks?.twitter ?? '',
      website: data.me.socialLinks?.website ?? '',
    });
    setAvatarPreviewFailed(false);
  }, [data]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { showToast('Name is required.', 'error'); return; }
    try {
      const result = await updateProfile({ variables: { input: {
        name: name.trim(), region: region.trim(), bio: bio.trim(), avatarUrl: avatarUrl.trim(),
        preferences, privacySettings: privacy,
        socialLinks: Object.fromEntries(Object.entries(social).map(([key, value]) => [key, value.trim()])),
      } } });
      useAuthStore.setState((state) => ({ dbUser: state.dbUser ? {
        ...state.dbUser,
        name: result.data.updateProfile.name,
        region: result.data.updateProfile.region,
        preferences: result.data.updateProfile.preferences,
      } : state.dbUser }));
      showToast('Profile and privacy settings saved.', 'success');
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : 'Profile could not be saved.', 'error');
    }
  }

  async function signOut() { await logout(); navigate('/'); }

  if (loading && !data) return <div className="mx-auto max-w-4xl px-6 py-12"><DirectoryState kind="loading" /></div>;
  if (error) return <div className="mx-auto max-w-4xl px-6 py-12"><DirectoryState kind="error" title="Profile could not be loaded" onRetry={() => refetch()} /></div>;

  const avatarCanPreview = Boolean(avatarUrl.trim()) && !avatarPreviewFailed;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 md:px-8">
      <div className="mb-7">
        <h1 className="font-serif text-4xl font-bold">Your profile</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your member details, discovery interests, and who can see your profile information.</p>
      </div>
      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Profile details</h2>
          <div className="mt-5 flex flex-col gap-7 sm:flex-row">
            <div className="shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#eee6ef] font-serif text-3xl font-bold">
                {avatarCanPreview ? <img src={avatarUrl} alt="Avatar preview" onError={() => setAvatarPreviewFailed(true)} className="h-full w-full object-cover" /> : (name || 'M').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="grid flex-1 gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">Name<input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Email<input value={data?.me?.email ?? ''} readOnly className="mt-2 w-full rounded-xl bg-gray-100 px-4 py-3 font-normal text-gray-500" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Region<input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="City, country" className={fieldClass} /></label>
              <label className="text-sm font-semibold sm:col-span-2">Avatar image URL<input type="url" value={avatarUrl} onChange={(event) => { setAvatarUrl(event.target.value); setAvatarPreviewFailed(false); }} placeholder="https://cdn.example.org/avatar.jpg" className={fieldClass} /></label>
              <div className="sm:col-span-2">
                <button type="button" disabled={!avatarUrl} onClick={() => { setAvatarUrl(''); setAvatarPreviewFailed(false); }} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40">Remove avatar</button>
                {avatarPreviewFailed && <span className="ml-3 text-xs text-red-600">This image could not be previewed.</span>}
              </div>
            </div>
          </div>
          <label className="mt-5 block text-sm font-semibold">Bio<textarea rows={4} maxLength={500} value={bio} onChange={(event) => setBio(event.target.value)} className={`${fieldClass} resize-none`} /><span className="mt-1 block text-right text-xs font-normal text-gray-400">{bio.length}/500</span></label>
          <p className="mt-3 rounded-xl bg-[#FAF6ED] px-4 py-3 text-xs leading-5 text-gray-600">Direct avatar file upload remains part of the separate Cloudinary media feature. The current control stores a public HTTPS image URL.</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Interests</h2>
          <p className="mt-1 text-sm text-gray-500">Used to personalise discovery results. Interests are not displayed publicly.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {INTERESTS.map((interest) => <label key={interest} className="flex items-center gap-3 rounded-xl bg-[#F4F0F5] px-4 py-3 text-sm"><input type="checkbox" checked={preferences.includes(interest)} onChange={(event) => setPreferences((items) => event.target.checked ? [...items, interest] : items.filter((item) => item !== interest))} className="h-4 w-4 accent-[#302D2E]" />{interest}</label>)}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Social links</h2>
          <p className="mt-1 text-sm text-gray-500">These are only shared when your social-links privacy switch is enabled.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Object.entries(social).map(([key, value]) => <label key={key} className="text-sm font-semibold capitalize">{key === 'twitter' ? 'X / Twitter' : key}<input type={key === 'whatsapp' ? 'tel' : 'url'} value={value} onChange={(event) => setSocial((current) => ({ ...current, [key]: event.target.value }))} placeholder={key === 'whatsapp' ? '+44 7700 900000' : `https://${key}.com/your-profile`} className={`${fieldClass} normal-case`} /></label>)}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-serif text-xl font-bold">Privacy settings</h2>
          <p className="mt-1 text-sm text-gray-500">Choose the audience for your extended profile, then choose which details that audience receives.</p>
          <fieldset className="mt-5 grid gap-3 sm:grid-cols-3">
            <legend className="sr-only">Profile visibility</legend>
            {VISIBILITY_OPTIONS.map((option) => <label key={option.value} className={`cursor-pointer rounded-xl border p-4 ${privacy.profileVisibility === option.value ? 'border-[#302D2E] bg-[#FAF6ED]' : 'border-gray-200'}`}><div className="flex items-center gap-2"><input type="radio" name="profileVisibility" value={option.value} checked={privacy.profileVisibility === option.value} onChange={() => setPrivacy((current) => ({ ...current, profileVisibility: option.value }))} className="accent-[#302D2E]" /><span className="text-sm font-semibold">{option.title}</span></div><p className="mt-2 text-xs leading-5 text-gray-500">{option.detail}</p></label>)}
          </fieldset>
          <div className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
            <PrivacyToggle label="Show profile photo" detail="Display your avatar on seller cards and member surfaces." checked={privacy.showAvatar} onChange={(value) => setPrivacy((current) => ({ ...current, showAvatar: value }))} disabled={privacy.profileVisibility === 'PRIVATE'} />
            <PrivacyToggle label="Show region" detail="Share your city or region with your selected audience." checked={privacy.showRegion} onChange={(value) => setPrivacy((current) => ({ ...current, showRegion: value }))} disabled={privacy.profileVisibility === 'PRIVATE'} />
            <PrivacyToggle label="Show bio" detail="Share your member bio with your selected audience." checked={privacy.showBio} onChange={(value) => setPrivacy((current) => ({ ...current, showBio: value }))} disabled={privacy.profileVisibility === 'PRIVATE'} />
            <PrivacyToggle label="Show social links" detail="Share the social and WhatsApp links entered above." checked={privacy.showSocialLinks} onChange={(value) => setPrivacy((current) => ({ ...current, showSocialLinks: value }))} disabled={privacy.profileVisibility === 'PRIVATE'} />
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">Your name and verification badge remain visible where needed for listings, applications, and conversations. Email, interests, and application details are never added to public profile surfaces.</p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button type="button" onClick={signOut} className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Sign out</button>
          <button type="submit" disabled={saving} className="rounded-full bg-[#302D2E] px-7 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>
    </main>
  );
}

function PrivacyToggle({ label, detail, checked, disabled, onChange }: { label: string; detail: string; checked: boolean; disabled?: boolean; onChange: (value: boolean) => void }) {
  return <label className={`flex items-center justify-between gap-5 px-4 py-4 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-gray-500">{disabled ? 'Hidden while profile visibility is set to Only me.' : detail}</span></span><span className="relative shrink-0"><input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span className="block h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-[#302D2E] peer-focus-visible:ring-2 peer-focus-visible:ring-[#C9A96E] peer-disabled:bg-gray-200" /><span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" /></span></label>;
}
