import { Link } from 'react-router-dom';

export default function OrgCTASection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background painting */}
      <img
        src="/assets/org-cta.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Pure black overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 py-20 flex flex-col gap-6">
        <h2 className="font-serif text-white text-3xl md:text-4xl font-bold leading-snug">
          One who is gracious to a poor man lends to the Lord,
          <br className="hidden md:block" />
          And He will repay him for his good deed.
        </h2>

        <p className="text-sm text-white/60 max-w-md">
          Your contributions keep this digital sanctuary alive. Join us in cultivating a
          global network of faith-based opportunities.
        </p>

        <div className="flex items-center gap-3 flex-wrap mt-2">
          <Link
            to="/marketplace"
            className="px-6 py-2.5 rounded-full bg-[#030813] text-white text-sm font-semibold hover:bg-[#030813]/80 transition-colors"
          >
            List Now
          </Link>
          <Link
            to="/org/signup"
            className="px-6 py-2.5 rounded-full border border-[#030813] bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
          >
            Sign Up as an Organization
          </Link>
        </div>
      </div>
    </section>
  );
}
