import { ReactNode } from 'react';

export default function StaticPageLayout({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#FAF8F3] px-5 pb-20 pt-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9A7744]">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-gray-900">{title}</h1>
        {intro && <p className="mt-3 text-gray-600">{intro}</p>}
        <div className="mt-10 space-y-8">{children}</div>
      </div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-gray-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-7 text-gray-700">{children}</div>
    </section>
  );
}
