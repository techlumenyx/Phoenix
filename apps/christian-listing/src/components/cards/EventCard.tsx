import { LocationMarkerIcon, ClockIcon, UsersIcon, HeartIcon, ArrowRightIcon } from '../layout/icons';

export interface EventCardProps {
  badge?: string;
  date?: string;
  title: string;
  description?: string;
  location?: string;
  time?: string;
  invites?: string;
  likes?: string;
  featured?: boolean;
  imageSrc?: string;
  ctaLabel?: string;
}

export default function EventCard({
  badge = 'EVENT/MINISTRY',
  date,
  title,
  description,
  location,
  time,
  invites,
  likes,
  featured = false,
  imageSrc,
  ctaLabel = 'RSVP Now',
}: EventCardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] text-white flex flex-col min-h-[320px]">
      {/* Background image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Featured dot */}
      {featured && (
        <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-green-400 z-10" />
      )}

      {/* Top row: badge + date */}
      <div className="relative z-10 flex items-start justify-between p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-purple-600/90">
          {badge}
        </span>
        {date && (
          <span className="text-[11px] text-white/70 font-medium">{date}</span>
        )}
      </div>

      {/* Content pushes to bottom */}
      <div className="relative z-10 mt-auto p-4 flex flex-col gap-2">
        <h3 className="text-lg font-bold leading-tight line-clamp-2">{title}</h3>
        {description && (
          <p className="text-xs text-white/70 line-clamp-2">{description}</p>
        )}

        <div className="flex flex-col gap-1 mt-1">
          {location && (
            <span className="flex items-center gap-1 text-xs text-white/60">
              <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0" />
              {location}
            </span>
          )}
          {time && (
            <span className="flex items-center gap-1 text-xs text-white/60">
              <ClockIcon className="w-3.5 h-3.5 shrink-0" />
              {time}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-xs text-white/60">
            {invites && (
              <span className="flex items-center gap-1">
                <UsersIcon className="w-3.5 h-3.5" /> {invites}
              </span>
            )}
            {likes && (
              <span className="flex items-center gap-1">
                <HeartIcon className="w-3.5 h-3.5" /> {likes}
              </span>
            )}
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-white hover:text-white/80 transition-colors">
            {ctaLabel}
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
