import { useEffect } from 'react';

interface RegistrationSuccessModalProps {
  event: {
    title: string;
    description: string;
    date: string;
    endDate?: string | null;
    location: { address?: string | null; city?: string | null; country?: string | null; virtualLink?: string | null };
  };
  onClose: () => void;
}

export default function RegistrationSuccessModal({ event, onClose }: RegistrationSuccessModalProps) {
  useEffect(() => {
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => { if (keyboardEvent.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = previousOverflow; };
  }, [onClose]);

  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const location = [event.location.address, event.location.city, event.location.country].filter(Boolean).join(', ') || event.location.virtualLink || '';
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${calendarDate(start)}/${calendarDate(end)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(location)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${encodeURIComponent(start.toISOString())}&enddt=${encodeURIComponent(end.toISOString())}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(location)}`;

  const downloadIcs = () => {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Christian Listings//Events//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@christian-listings`, `DTSTAMP:${calendarDate(new Date())}`, `DTSTART:${calendarDate(start)}`, `DTEND:${calendarDate(end)}`, `SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(event.description)}`, `LOCATION:${escapeIcs(location)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(mouseEvent) => { if (mouseEvent.target === mouseEvent.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="registration-success-title" className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(164,130,62,0.25)]">
        <button onClick={onClose} aria-label="Close registration confirmation" className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-xl text-gray-700 shadow-sm hover:bg-white">×</button>

        <header className="relative flex h-48 flex-col items-center justify-center overflow-hidden bg-[#ebe8dc]">
          <img src="/assets/background/background.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-[#ebe8dc]/65" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-300/80 text-4xl text-fuchsia-800">✦</div>
          <span className="relative mt-4 rounded-full bg-fuchsia-300/90 px-7 py-2 text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-900">Registration Success</span>
        </header>

        <div className="px-6 py-9 text-center sm:px-12">
          <h2 id="registration-success-title" className="font-serif text-4xl font-semibold text-[#030813]">You&apos;re Registered!</h2>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-7 text-gray-800">Your RSVP for <strong>“{event.title}”</strong> has been registered. The event team will contact you with any further information.</p>

          <p className="mt-9 text-sm font-medium uppercase tracking-widest text-gray-500">Add to Calendar</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a href={googleUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#eff4ff] px-5 py-3 text-sm font-medium text-[#030813] hover:bg-[#e1eafd]">▣ &nbsp; Google</a>
            <a href={outlookUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#eff4ff] px-5 py-3 text-sm font-medium text-[#030813] hover:bg-[#e1eafd]">▦ &nbsp; Outlook</a>
            <button onClick={downloadIcs} className="rounded-lg bg-[#eff4ff] px-5 py-3 text-sm font-medium text-[#030813] hover:bg-[#e1eafd]">⠿ &nbsp; iCal</button>
          </div>
        </div>

        <footer className="bg-[#f2f5fd] px-7 py-7 text-center text-sm leading-6 text-gray-800">Registration records your place. Please check event updates from the organiser before travelling to the venue.</footer>
      </section>
    </div>
  );
}

function calendarDate(date: Date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
function escapeIcs(value: string) { return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
