import { LocationMarkerIcon, BriefcaseIcon, ArrowRightIcon } from '../layout/icons';
import { Link } from 'react-router-dom';

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
  const badgeStyles: Record<string, string> = {
    green:  'bg-green-100 text-green-700',
    blue:   'bg-blue-100 text-blue-700',
    purple: 'bg-[#F5EAFF] text-[#A460A5]',
  };

  return (
    <div className={`relative rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3 min-h-[320px] ${className}`}>
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

      {href ? <Link to={href} className="mt-2 flex items-center gap-1 text-xs font-semibold text-dark hover:text-black transition-colors self-start">{ctaLabel}<ArrowRightIcon className="w-3.5 h-3.5" /></Link> : <button className="mt-2 flex items-center gap-1 text-xs font-semibold text-dark hover:text-black transition-colors self-start">{ctaLabel}<ArrowRightIcon className="w-3.5 h-3.5" /></button>}
    </div>
  );
}
