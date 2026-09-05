import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function ContactPage() {
  return (
    <StaticPageLayout eyebrow="Get in Touch" title="Contact Us" intro="We'd love to hear from you.">
      <Section title="Email">
        <p>
          For general questions, support requests, or feedback, reach us at{' '}
          <a href="mailto:christianlistingsinfo@gmail.com" className="font-semibold text-[#1B1B1B] underline">
            christianlistingsinfo@gmail.com
          </a>
          . We try to respond to every message.
        </p>
      </Section>

      <Section title="Reporting a listing or conversation">
        <p>
          If you need to report a specific event, job, listing, or message, the fastest way is from within your account — open the item and
          use the report option there, or visit My Reports from your dashboard.
        </p>
      </Section>
    </StaticPageLayout>
  );
}
