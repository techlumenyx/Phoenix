import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function CareersPage() {
  return (
    <StaticPageLayout eyebrow="Join Us" title="Careers" intro="Help us build a home for faith communities online.">
      <Section title="No open positions right now">
        <p>
          We don't have any open roles at the moment, but we're always glad to hear from people who care about this community. If you'd like
          to introduce yourself or hear about future opportunities, email us at{' '}
          <a href="mailto:christianlistingsinfo@gmail.com" className="font-semibold text-[#1B1B1B] underline">
            christianlistingsinfo@gmail.com
          </a>{' '}
          and we'll keep you in mind.
        </p>
      </Section>
    </StaticPageLayout>
  );
}
