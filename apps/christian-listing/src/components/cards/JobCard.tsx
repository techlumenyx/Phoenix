import { LocationMarkerIcon, BriefcaseIcon, ArrowRightIcon } from '../layout/icons';

export interface JobCardProps {
  badge?: string;
  title: string;
  company: string;
  salaryRange?: string;
  location?: string;
  employmentType?: string;
  featured?: boolean;
}

export default function JobCard({
  badge = 'JOB LISTING',
  title,
  company,
  salaryRange,
  location,
  employmentType,
  featured = false,
}: JobCardProps) {
  return (
    <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3 min-h-[320px]">
      {/* Featured dot */}
      {featured && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-400" />
      )}

      {/* Badge */}
      <span className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-100 text-green-700">
        {badge}
      </span>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-3">{title}</h3>

      {/* Company */}
      <p className="text-sm text-gray-500 font-medium">{company}</p>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 mt-auto">
        {salaryRange && (
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-semibold text-gray-800">{salaryRange}</span>
          </span>
        )}
        {location && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            {location}
          </span>
        )}
        {employmentType && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <BriefcaseIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            {employmentType}
          </span>
        )}
      </div>

      {/* CTA */}
      <button className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-800 hover:text-black transition-colors self-start">
        Apply Now
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
