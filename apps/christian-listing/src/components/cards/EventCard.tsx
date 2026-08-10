import { LocationMarkerIcon, ClockIcon, UsersIcon, HeartIcon, ArrowRightIcon } from '../layout/icons';
import { Link } from 'react-router-dom';
import { useContentImpression } from '../../hooks/useContentImpression';

export interface EventCardProps {
  badge?: string;
  date?: string;
  title: string;
  description?: string;
  location?: string;
  time?: string;
  invites?: string;
  likes?: string;
  verified?: boolean;
  imageSrc?: string;
  ctaLabel?: string;
  className?: string;
  href?: string;
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
  verified = false,
  imageSrc,
  ctaLabel = 'RSVP Now',
  className = '',
  href,
}: EventCardProps) {
  const analyticsRef = useContentImpression('EVENT', href);
  const cardClassName = `group relative rounded-2xl overflow-hidden bg-[#1A1A1A] text-white flex flex-col min-h-[320px] ${href ? 'cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A460A5]' : ''} ${className}`;
  const content = <>
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {verified && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#22C55E] z-10" />
      )}

      <div className="relative z-10 flex items-start justify-between p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#A460A5] text-white">
          {badge}
        </span>
        {date && (
          <span className="text-[11px] text-white/70 font-medium">{date}</span>
        )}
      </div>

      <div className="relative z-10 mt-auto p-4 flex flex-col gap-2">
        <h3 className="text-lg font-serif font-bold leading-tight line-clamp-2">{title}</h3>
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

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
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
          <span className="flex items-center gap-1 text-xs font-semibold text-white transition-transform group-hover:translate-x-0.5">
            {ctaLabel}<ArrowRightIcon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </>;

  return href
    ? <Link ref={analyticsRef} to={href} aria-label={`${ctaLabel}: ${title}`} className={cardClassName}>{content}</Link>
    : <div ref={analyticsRef} className={cardClassName}>{content}</div>;
}
