import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  MY_ORGANISATIONS,
  SET_ORGANISATION_ACTIVE,
  UPDATE_ORGANISATION,
} from '../../graphql/mutations';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/ToastProvider';
import DirectoryState from '../../components/ui/DirectoryState';
import ConfirmationDialog from '../../components/ui/ConfirmationDialog';
import { uploadMedia } from '../../lib/mediaUpload';

interface SocialLinks {
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  website?: string | null;
}

interface OrgData {
  id: string;
  name: string;
  description?: string | null;
  region?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  contactEmail?: string | null;
  phoneNumber?: string | null;
  socialLinks?: SocialLinks | null;
  isActive: boolean;
  deactivatedAt?: string | null;
}

const fieldClass =
  'mt-2 w-full rounded-lg bg-[#F4F0F5] px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#C9A96E]/40';

export default function OrgSettingsPage() {
  const { showToast } = useToast();
  const signedInEmail = useAuthStore((state) => state.user?.email);
  const { data, loading, error, refetch } = useQuery(MY_ORGANISATIONS);
  const org: OrgData | null = data?.myOrganisations?.[0] ?? null;
  const [updateOrg, { loading: saving }] = useMutation(UPDATE_ORGANISATION, {
    refetchQueries: [{ query: MY_ORGANISATIONS }],
  });
  const [setOrganisationActive, { loading: changingStatus }] = useMutation(
    SET_ORGANISATION_ACTIVE,
    { refetchQueries: [{ query: MY_ORGANISATIONS }] },
  );
  const [showLifecycleDialog, setShowLifecycleDialog] = useState(false);
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [social, setSocial] = useState<Record<keyof SocialLinks, string>>({
    whatsapp: '',
    instagram: '',
    facebook: '',
    twitter: '',
    website: '',
  });

  useEffect(() => {
    if (!org) return;
    setName(org.name ?? '');
    setRegion(org.region ?? '');
    setDescription(org.description ?? '');
    setWebsite(org.websiteUrl ?? '');
    setLogoUrl(org.logoUrl ?? '');
    setContactEmail(org.contactEmail ?? '');
    setPhoneNumber(org.phoneNumber ?? '');
    setSocial({
      whatsapp: org.socialLinks?.whatsapp ?? '',
      instagram: org.socialLinks?.instagram ?? '',
      facebook: org.socialLinks?.facebook ?? '',
      twitter: org.socialLinks?.twitter ?? '',
      website: org.socialLinks?.website ?? '',
    });
    setLogoPreviewFailed(false);
  }, [org]);

  useEffect(() => {
    if (window.location.hash !== '#social-links') return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('social-links')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!org || !name.trim()) {
      showToast('Organisation name is required.', 'error');
      return;
    }
    try {
      await updateOrg({
        variables: {
          id: org.id,
          input: {
            name: name.trim(),
            region: region.trim(),
            description: description.trim(),
            websiteUrl: websiteUrl.trim(),
            logoUrl: logoUrl.trim(),
            contactEmail: contactEmail.trim(),
            phoneNumber: phoneNumber.trim(),
            socialLinks: Object.fromEntries(
              Object.entries(social).map(([key, value]) => [key, value.trim()]),
            ),
          },
        },
      });
      showToast('Organisation settings saved.', 'success');
    } catch {
      showToast('Settings could not be saved. Please try again.', 'error');
    }
  }

  async function changeLifecycleStatus() {
    if (!org) return;
    try {
      await setOrganisationActive({
        variables: { organisationId: org.id, active: !org.isActive },
      });
      setShowLifecycleDialog(false);
      showToast(
        org.isActive
          ? 'Organisation deactivated. Your data and team access have been retained.'
          : 'Organisation reactivated and visible publicly again.',
        'success',
      );
    } catch {
      showToast('Organisation status could not be changed. Please try again.', 'error');
    }
  }

  if (loading && !data) {
    return <div className="mx-auto max-w-5xl p-6"><DirectoryState kind="loading" /></div>;
  }
  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <DirectoryState kind="error" title="Settings could not be loaded" onRetry={() => refetch()} />
      </div>
    );
  }
  if (!org) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <DirectoryState
          kind="empty"
          title="No organisation found"
          detail="Complete organisation onboarding before editing settings."
        />
      </div>
    );
  }

  const logoCanPreview = Boolean(logoUrl.trim()) && !logoPreviewFailed;

  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-[#1B1B1B]">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-4xl font-bold">Settings</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your public organisation profile, contact channels, and account status.
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${org.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
          {org.isActive ? 'Active' : 'Deactivated'}
        </span>
      </div>

      {!org.isActive && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          This organisation is deactivated. Its public profile and directory entry are hidden, but
          settings, data, and authorised team access are retained.
        </div>
      )}

      <form onSubmit={save} className="space-y-6">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-serif text-xl font-bold">Profile details</h2>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className="text-sm font-bold">
              Display name
              <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
            </label>
            <label className="text-sm font-bold">
              Region
              <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="London, United Kingdom" className={fieldClass} />
            </label>
            <label className="text-sm font-bold md:col-span-2">
              About the organisation
              <textarea rows={4} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} className={`${fieldClass} resize-none`} />
              <span className="mt-1 block text-right text-[11px] font-normal text-gray-400">{description.length}/1000</span>
            </label>
            <label className="text-sm font-bold md:col-span-2">
              Primary website
              <input type="url" value={websiteUrl} onChange={(event) => setWebsite(event.target.value)} placeholder="https://organisation.org" className={fieldClass} />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-serif text-xl font-bold">Organisation logo</h2>
            <p className="mt-1 text-xs text-gray-500">Use a square image served over HTTPS for the best result.</p>
          </div>
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-[#EAEAF5] text-3xl font-bold">
              {logoCanPreview ? (
                <img src={logoUrl} alt={`${name} logo preview`} onError={() => setLogoPreviewFailed(true)} className="h-full w-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm font-bold">
                Logo image URL
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(event) => { setLogoUrl(event.target.value); setLogoPreviewFailed(false); }}
                  placeholder="https://cdn.example.org/logo.png"
                  className={fieldClass}
                />
              </label>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-lg bg-[#1B1B1B] px-4 py-2 text-xs font-semibold text-white">{logoUploading ? 'Uploading…' : 'Upload logo'}<input disabled={logoUploading} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; setLogoUploading(true); try { const uploaded = await uploadMedia(file, 'ORGANISATION_LOGO', org.id); setLogoUrl(uploaded.url); setLogoPreviewFailed(false); } catch (value) { showToast(value instanceof Error ? value.message : 'Logo upload failed.', 'error'); } finally { setLogoUploading(false); event.target.value = ''; } }} /></label>
                <button type="button" disabled={!logoUrl} onClick={() => { setLogoUrl(''); setLogoPreviewFailed(false); }} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  Remove logo
                </button>
                {logoPreviewFailed && <span className="text-xs text-red-600">This image could not be previewed. Check that the URL is public.</span>}
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">Uploaded logos are optimised and delivered through the platform media service.</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-serif text-xl font-bold">Contact details</h2>
            <p className="mt-1 text-xs text-gray-500">Public contact channels for enquiries about your organisation.</p>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className="text-sm font-bold">
              Contact email
              <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="hello@organisation.org" className={fieldClass} />
            </label>
            <label className="text-sm font-bold">
              Contact phone
              <input type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+44 20 1234 5678" className={fieldClass} />
            </label>
          </div>
        </section>

        <section id="social-links" className="scroll-mt-24 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-serif text-xl font-bold">Social links</h2>
            <p className="mt-1 text-xs text-gray-500">These links appear on the public organisation profile.</p>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            {Object.entries(social).map(([key, value]) => (
              <label key={key} className="text-sm font-bold capitalize">
                {key === 'twitter' ? 'X / Twitter' : key}
                <input
                  type={key === 'whatsapp' ? 'tel' : 'url'}
                  value={value}
                  onChange={(event) => setSocial((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={key === 'whatsapp' ? '+44 7700 900000' : `https://${key}.com/your-organisation`}
                  className={`${fieldClass} normal-case`}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4"><h2 className="font-serif text-xl font-bold">Account and team access</h2></div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <div><p className="text-xs font-bold uppercase tracking-wide text-gray-400">Signed-in email</p><p className="mt-2 text-sm text-gray-700">{signedInEmail ?? '—'}</p></div>
            <div className="flex items-center justify-start md:justify-end"><Link to="/org/team" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50">Manage team and roles →</Link></div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-lg bg-[#302D2E] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>

      <section className="mt-8 overflow-hidden rounded-xl border border-red-200 bg-white">
        <div className="border-b border-red-100 px-6 py-4"><h2 className="font-serif text-xl font-bold text-red-800">Organisation lifecycle</h2></div>
        <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">{org.isActive ? 'Deactivate organisation' : 'Reactivate organisation'}</p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">
              {org.isActive
                ? 'Hide the public organisation profile and directory entry while retaining its data, settings, and team access.'
                : 'Restore the organisation profile and make it discoverable to members again.'}
            </p>
          </div>
          <button type="button" onClick={() => setShowLifecycleDialog(true)} className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold ${org.isActive ? 'border border-red-300 text-red-700 hover:bg-red-50' : 'bg-[#302D2E] text-white hover:bg-black'}`}>
            {org.isActive ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </section>

      <ConfirmationDialog
        open={showLifecycleDialog}
        title={org.isActive ? 'Deactivate organisation?' : 'Reactivate organisation?'}
        description={org.isActive
          ? 'The public organisation profile and directory entry will be hidden. Existing data and team access will remain available so the organisation can be restored later.'
          : 'The organisation profile will become public and discoverable again.'}
        confirmLabel={org.isActive ? 'Deactivate organisation' : 'Reactivate organisation'}
        tone={org.isActive ? 'danger' : 'default'}
        busy={changingStatus}
        onClose={() => setShowLifecycleDialog(false)}
        onConfirm={changeLifecycleStatus}
      />
    </main>
  );
}
