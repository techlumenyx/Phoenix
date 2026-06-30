import { Link } from 'react-router-dom';
import { LocationMarkerIcon, ClockIcon, UsersIcon, HeartIcon, ArrowRightIcon } from '../layout/icons';

function LightEventCard() {
  return (
    <div className="flex rounded-2xl overflow-hidden bg-[#F5EAFF] h-full">
      {/* Left: image */}
      <div className="w-[45%] shrink-0 relative">
        <img
          src="/assets/event-theology.png"
          alt="Theology of Work event"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Right: content */}
      <div className="flex flex-col p-5 gap-3 flex-1 min-w-0">
        {/* Badge + date row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#A460A5] text-white">
            STUDY/WORSHIP
          </span>
          <span className="text-xs text-dark/60 font-medium shrink-0">24 OCT 2026</span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-dark text-xl leading-snug line-clamp-3">
          Theology of Work: A Masterclass for Professionals
        </h3>

        {/* Description */}
        <p className="text-xs text-dark/60 line-clamp-2">
          An evening of peace and calm aimed to help youngsters learn the word of God.
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 mt-auto">
          <span className="flex items-center gap-1.5 text-xs text-dark/60">
            <LocationMarkerIcon className="w-3.5 h-3.5 shrink-0" />
            Lagos City Centre
          </span>
          <span className="flex items-center gap-1.5 text-xs text-dark/60">
            <ClockIcon className="w-3.5 h-3.5 shrink-0" />
            09:30 AM To 06:00 PM
          </span>
        </div>

        <hr className="border-dark/10" />

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-dark/50">
            <span className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" /> 3500 Invites
            </span>
            <span className="flex items-center gap-1">
              <HeartIcon className="w-3.5 h-3.5" /> 15K Likes
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-dark hover:text-dark/70 transition-colors">
            RSVP Now <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DarkEventCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#1A1A1A] h-full">
      {/* Full bleed image */}
      <img
        src="/assets/event-theology.png"
        alt="Theology of Work event"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Verified dot */}
      <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#22C55E] z-10" />

      {/* Category badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#A460A5] text-white">
          STUDY/WORSHIP
        </span>
      </div>

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 flex flex-col gap-3">
        <h3 className="font-serif font-bold text-white text-xl leading-snug">
          Theology of Work: A Masterclass for Professionals
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" /> 3500 Invites
            </span>
            <span className="flex items-center gap-1">
              <HeartIcon className="w-3.5 h-3.5" /> 15K Likes
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-white hover:text-white/80 transition-colors">
            RSVP Now <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventsGlanceSection() {
  return (
    <section className="w-full bg-white px-6 md:px-10 lg:px-16 py-16">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-display text-xs font-medium text-dark/40 tracking-wider uppercase mb-1">
            The trending events of this week
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-dark">
            Events at a Glance
          </h2>
        </div>

        <Link
          to="/events"
          className="font-display text-xs font-semibold uppercase tracking-wider text-dark/50 hover:text-dark transition-colors flex items-center gap-1 shrink-0 mb-1"
        >
          VIEW ALL EVENTS
          <ArrowRightIcon className="w-3.5 h-3.5 -rotate-45" />
        </Link>
      </div>

      {/* Fixed 2-up grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[400px]">
        <LightEventCard />
        <DarkEventCard />
      </div>
    </section>
  );
}
