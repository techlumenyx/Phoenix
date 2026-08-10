import { LocationMarkerIcon, ArrowRightIcon } from '../layout/icons';
import { Link } from 'react-router-dom';
import { useContentImpression } from '../../hooks/useContentImpression';

export interface MarketplaceCardProps {
  badge?: string;
  title: string;
  description?: string;
  price: string;
  location?: string;
  imageSrc?: string;
  verified?: boolean;
  className?: string;
  href?: string;
}

export default function MarketplaceCard({
  badge = 'FOR SALE',
  title,
  description,
  price,
  location,
  imageSrc,
  verified = false,
  className = '',
  href,
}: MarketplaceCardProps) {
  const analyticsRef = useContentImpression('MARKETPLACE', href);
  const cardClassName = `group relative rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[320px] ${href ? 'cursor-pointer transition duration-200 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004B3D]' : ''} ${className}`;
  const content = <>
      {verified && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#22C55E] z-10" />
      )}

      <div className="relative h-44 shrink-0 overflow-hidden bg-gray-100">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="block h-full w-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/90 text-white">
          {badge}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2 shrink-0">
        <h3 className="text-sm font-bold text-dark line-clamp-2">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
        )}
        {location && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0" />
            {location}
          </span>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-dark">{price}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 transition-transform group-hover:translate-x-0.5">View <ArrowRightIcon className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </>;

  return href
    ? <Link ref={analyticsRef} to={href} aria-label={`View: ${title}`} className={cardClassName}>{content}</Link>
    : <div ref={analyticsRef} className={cardClassName}>{content}</div>;
}
