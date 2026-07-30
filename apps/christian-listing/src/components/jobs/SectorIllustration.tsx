interface SectorIllustrationProps {
  sector: 'technology' | 'operations' | 'education' | 'care';
  className?: string;
}

export default function SectorIllustration({ sector, className }: SectorIllustrationProps) {
  const commonProps = {
    className,
    viewBox: '0 0 180 140',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  } as const;

  if (sector === 'technology') {
    return (
      <svg {...commonProps}>
        <circle cx="136" cy="34" r="30" fill="currentColor" fillOpacity=".12" />
        <rect x="29" y="27" width="119" height="77" rx="9" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="3" />
        <path d="m76 56-14 12 14 12M103 56l14 12-14 12M96 48 84 88" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 115h141c0 8-6 14-14 14H32c-8 0-14-6-14-14Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  }

  if (sector === 'operations') {
    return (
      <svg {...commonProps}>
        <circle cx="39" cy="103" r="27" fill="currentColor" fillOpacity=".1" />
        <rect x="47" y="20" width="86" height="110" rx="10" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="3" />
        <path d="M74 20v-4c0-5 4-9 9-9h14c5 0 9 4 9 9v4" stroke="currentColor" strokeWidth="3" />
        <rect x="68" y="15" width="44" height="17" rx="6" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="3" />
        <path d="m66 56 6 6 11-13M91 56h23M66 83l6 6 11-13M91 83h23M66 109l6 6 11-13M91 109h23" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="139" cy="48" r="18" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="3" />
        <path d="M139 39v10l7 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (sector === 'education') {
    return (
      <svg {...commonProps}>
        <circle cx="91" cy="69" r="59" fill="currentColor" fillOpacity=".08" />
        <path d="M18 39c25-6 49 0 72 17v69c-23-17-47-23-72-17V39ZM162 39c-25-6-49 0-72 17v69c23-17 47-23 72-17V39Z" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M90 56v69M35 57c15-1 28 3 40 12M35 74c15-1 28 3 40 12M145 57c-15-1-28 3-40 12M145 74c-15-1-28 3-40 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="m90 15 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1 4-9Z" fill="currentColor" fillOpacity=".24" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="90" cy="70" r="62" fill="currentColor" fillOpacity=".08" />
      <path d="M90 120S31 89 31 49c0-19 14-32 31-32 13 0 23 7 28 18 5-11 15-18 28-18 17 0 31 13 31 32 0 40-59 71-59 71Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M57 70h21l8-18 11 34 8-16h20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M90 27v18M81 36h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
