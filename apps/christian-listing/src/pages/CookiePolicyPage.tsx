import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function CookiePolicyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Cookie Policy"
      intro={`Last updated: ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`}
    >
      <Section title="What This Covers">
        <p>
          This page explains how Christian Listings uses cookies and similar browser storage. It works alongside our{' '}
          <a href="/privacy" className="font-semibold text-[#1B1B1B] underline">
            Privacy Policy
          </a>
          .
        </p>
      </Section>

      <Section title="Essential Storage">
        <p>
          We use your browser's local storage to keep you signed in between visits and remember basic preferences. This is essential to how
          the platform works — without it, you'd need to sign in again every time you visit.
        </p>
      </Section>

      <Section title="Analytics">
        <p>
          We collect anonymized, first-party usage data (for example, which events, jobs, or listings are viewed) to understand what's
          useful and improve the platform. We don't use third-party advertising or tracking cookies, and we don't share this data with ad
          networks.
        </p>
      </Section>

      <Section title="Fonts">
        <p>
          We load some fonts from Google Fonts, which may involve your browser making a request to Google's servers. This is used only to
          display text correctly and isn't used for tracking.
        </p>
      </Section>

      <Section title="Managing Your Storage">
        <p>
          You can clear cookies and local storage at any time through your browser settings. Doing so will sign you out and reset any saved
          preferences.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We may update this policy as the platform evolves. We'll update the date at the top of this page when we do.</p>
      </Section>

      <Section title="Contact Us">
        <p>
          Questions about this policy? Email us at{' '}
          <a href="mailto:christianlistingsinfo@gmail.com" className="font-semibold text-[#1B1B1B] underline">
            christianlistingsinfo@gmail.com
          </a>
          .
        </p>
      </Section>
    </StaticPageLayout>
  );
}
