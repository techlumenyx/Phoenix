import { ReactNode, useEffect, useRef, useState } from 'react';

export default function DirectoryFilters({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-5 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-directory-filters"
      >
        Filters <span aria-hidden="true">☰</span>
      </button>
      <aside className="hidden space-y-6 lg:block" aria-label="Search filters">
        {children}
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/45 lg:hidden"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          <aside
            id="mobile-directory-filters"
            role="dialog"
            aria-modal="true"
            aria-label="Search filters"
            className="ml-auto h-full w-[min(360px,90vw)] overflow-y-auto bg-white p-5 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Filters</h2>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-xl hover:bg-gray-100"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">{children}</div>
            <button
              onClick={() => setOpen(false)}
              className="mt-8 w-full rounded-xl bg-[#1B1B1B] px-4 py-3 text-sm font-semibold text-white"
            >
              Show results
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
