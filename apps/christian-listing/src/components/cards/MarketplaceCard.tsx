import { LocationMarkerIcon, ArrowRightIcon } from '../layout/icons';

export interface MarketplaceCardProps {
  badge?: string;
  title: string;
  description?: string;
  price: string;
  location?: string;
  imageSrc?: string;
  featured?: boolean;
}

export default function MarketplaceCard({
  badge = 'FOR SALE',
  title,
  description,
  price,
  location,
  imageSrc,
  featured = false,
}: MarketplaceCardProps) {
  return (
    <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[320px]">
      {/* Featured dot */}
      {featured && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-400 z-10" />
      )}

      {/* Image */}
      <div className="relative h-44 bg-gray-100 shrink-0">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {/* Badge over image */}
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/90 text-white">
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
        )}

        {location && (
          <span className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
            <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0" />
            {location}
          </span>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-gray-900">{price}</span>
          <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-black transition-colors">
            View
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
