import ResilientImage from './ResilientImage';
import { contentInitials } from './ContentPlaceholder';

const PALETTES = [
  'bg-gradient-to-br from-[#e9dfcd] to-[#d5c39f] text-[#654e28]',
  'bg-gradient-to-br from-[#e3d6e5] to-[#c9adc9] text-[#5d3159]',
  'bg-gradient-to-br from-[#dbe8df] to-[#b8d0be] text-[#315844]',
];

function paletteFor(name: string) {
  const hash = Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0);
  return PALETTES[hash % PALETTES.length];
}

interface NameAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
  imageClassName?: string;
}

export default function NameAvatar({ name, src, className = '', imageClassName = 'object-cover' }: NameAvatarProps) {
  const initials = contentInitials(name);
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden font-serif font-bold ${className}`}>
      <ResilientImage
        src={src}
        alt={`${name} ${src ? 'image' : 'initials'}`}
        className={`h-full w-full ${imageClassName}`}
        fallback={<span className={`flex h-full w-full items-center justify-center ${paletteFor(name)}`} aria-label={`${name} initials`}>{initials}</span>}
      />
    </span>
  );
}
