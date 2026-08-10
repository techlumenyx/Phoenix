import { LocationMarkerIcon, BriefcaseIcon, ArrowRightIcon } from '../layout/icons';
import { Link } from 'react-router-dom';
import { useContentImpression } from '../../hooks/useContentImpression';

export interface JobCardProps {
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'purple';
  title: string;
  company: string;
  salaryRange?: string;
  location?: string;
  employmentType?: string;
  verified?: boolean;
  ctaLabel?: string;
  className?: string;
  href?: string;
}

export default function JobCard({
  badge = 'JOB LISTING',
  badgeColor = 'green',
  title,
  company,
  salaryRange,
  location,
  employmentType,
  verified = false,
  ctaLabel = 'Apply Now',
  className = '',
  href,
}: JobCardProps) {
  const analyticsRef = useContentImpression('JOB', href);
  const badgeStyles: Record<string, string> = {
    green:  'bg-green-100 text-green-700',
    blue:   'bg-blue-100 text-blue-700',
    purple: 'bg-[#F5EAFF] text-[#A460A5]',
  };

  const cardClassName = `group relative rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3 min-h-[320px] ${href ? 'cursor-pointer transition duration-200 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]' : ''} ${className}`;
  const content = <>
      <BriefcaseIcon className="pointer-events-none absolute -right-5 top-12 h-32 w-32 text-[#405D51]/[0.07]" />
      {verified && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
      )}

      <span className={`self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeStyles[badgeColor]}`}>
        {badge}
      </span>

      <h3 className="text-2xl font-serif font-bold text-dark leading-tight line-clamp-3">{title}</h3>

      <p className="text-sm text-gray-500 font-medium">{company}</p>

      <div className="flex flex-col gap-1.5 mt-auto">
        {salaryRange && (
          <span className="text-xs font-semibold text-dark">{salaryRange}</span>
        )}
        {employmentType && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <BriefcaseIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            {employmentType}
          </span>
        )}
        {location && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            {location}
          </span>
        )}
      </div>

      <span className="mt-2 flex items-center gap-1 self-start text-xs font-semibold text-dark transition-transform group-hover:translate-x-0.5">{ctaLabel}<ArrowRightIcon className="w-3.5 h-3.5" /></span>
    </>;

  return href
    ? <Link ref={analyticsRef} to={href} aria-label={`${ctaLabel}: ${title}`} className={cardClassName}>{content}</Link>
    : <div ref={analyticsRef} className={cardClassName}>{content}</div>;
}
