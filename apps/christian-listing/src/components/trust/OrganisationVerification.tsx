import { useEffect, useId, useRef, useState } from 'react';

export type OrganisationVerificationContext = 'event' | 'job' | 'listing';

interface VerificationProps {
  organisationName: string;
  isVerified: boolean;
  context: OrganisationVerificationContext;
}

function verificationMessage(organisationName: string, context: OrganisationVerificationContext) {
  const guidance = {
    event: 'Confirm the event details before registering or making a payment.',
    job: 'Confirm the role and employer details before applying or sharing personal information.',
    listing: 'Confirm the item, seller and payment details before arranging a transaction.',
  }[context];

  return `${organisationName} has not completed Christian Listings verification. ${guidance}`;
}

export function OrganisationVerificationStatus({ organisationName, isVerified, context }: VerificationProps) {
  const [openedByTap, setOpenedByTap] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!openedByTap) return;

    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenedByTap(false);
    };

    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [openedByTap]);

  if (isVerified) return <span className="font-semibold text-green-700">✓ Verified Poster</span>;

  const message = verificationMessage(organisationName, context);

  return (
    <span ref={rootRef} className="group relative inline-flex">
      <button
        type="button"
        aria-describedby={tooltipId}
        aria-expanded={openedByTap}
        onClick={() => setOpenedByTap((current) => !current)}
        className="inline-flex items-center gap-1 rounded-full border border-[#dfbd58] bg-[#fff8e6] px-2 py-1 font-semibold text-[#76520b] outline-none transition hover:bg-[#fff1c7] focus-visible:ring-2 focus-visible:ring-[#b98517] focus-visible:ring-offset-2"
      >
        <span aria-hidden="true">⚠</span>
        <span>Unverified</span>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`${openedByTap ? 'visible opacity-100' : 'invisible opacity-0'} absolute bottom-[calc(100%+0.6rem)] right-0 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-[#2d271b] px-4 py-3 text-left text-xs font-normal leading-5 text-white shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100`}
      >
        {message}
        <span className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-[#2d271b]" aria-hidden="true" />
      </span>
    </span>
  );
}

export function OrganisationVerificationNotice({ organisationName, isVerified, context }: VerificationProps) {
  if (isVerified) return null;

  return (
    <aside aria-label="Organisation verification warning" className="rounded-xl border border-[#dfbd58] bg-[#fff8e6] p-4 text-[#4f3a12]">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3d77e] text-sm">⚠</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#76520b]">Unverified organisation</p>
          <p className="mt-1 text-xs leading-5">{verificationMessage(organisationName, context)}</p>
        </div>
      </div>
    </aside>
  );
}
