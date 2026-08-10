export type ContentPlaceholderVariant = 'event' | 'marketplace';

const IGNORED_WORDS = new Set(['a', 'an', 'and', 'at', 'for', 'in', 'of', 'on', 'the', 'to']);

export function contentInitials(title: string) {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = words.filter((word) => !IGNORED_WORDS.has(word.toLowerCase()));
  const selected = meaningful.length ? meaningful : words;
  if (!selected.length) return 'CL';
  if (selected.length === 1) return selected[0].slice(0, 2).toUpperCase();
  return `${selected[0][0]}${selected[1][0]}`.toUpperCase();
}

interface ContentPlaceholderProps {
  variant: ContentPlaceholderVariant;
  title: string;
  label?: string;
  className?: string;
}

export default function ContentPlaceholder({ variant, title, label, className = '' }: ContentPlaceholderProps) {
  const initials = contentInitials(title);

  if (variant === 'event') {
    return (
      <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#44243f] via-[#75406d] to-[#24202a] text-white ${className}`}>
        <span className="absolute -right-16 -top-14 h-56 w-56 rounded-full border border-white/15 shadow-[0_0_0_32px_rgba(255,255,255,0.035),0_0_0_64px_rgba(255,255,255,0.025)]" />
        <span className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full border border-white/15" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 font-serif text-3xl tracking-wider" aria-hidden="true">
          {initials}
        </span>
        <span className="sr-only">No image available for {title}</span>
      </div>
    );
  }

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#ebe1ca] via-[#d7c39b] to-[#a9bca6] text-[#315044] ${className}`}>
      <span className="absolute -bottom-24 -right-12 h-48 w-48 rounded-full border border-[#315044]/20 shadow-[0_0_0_30px_rgba(49,80,68,0.045),0_0_0_60px_rgba(49,80,68,0.035)]" />
      <span className="relative flex flex-col items-center gap-1.5" aria-hidden="true">
        <span className="font-serif text-4xl tracking-[0.12em]">{initials}</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">{label || 'Marketplace'}</span>
      </span>
      <span className="sr-only">No image available for {title}</span>
    </div>
  );
}
