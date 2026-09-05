import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function BlogPage() {
  return (
    <StaticPageLayout eyebrow="Journal" title="Blog" intro="Stories, updates, and resources from the Christian Listings community.">
      <Section title="Coming soon">
        <p>
          We're working on bringing you stories from ministries and organizations across the community, along with updates on new features.
          In the meantime, check the{' '}
          <a href="/whats-new" className="font-semibold text-[#1B1B1B] underline">
            What's New
          </a>{' '}
          page for the latest product updates, or reach out at{' '}
          <a href="mailto:christianlistingsinfo@gmail.com" className="font-semibold text-[#1B1B1B] underline">
            christianlistingsinfo@gmail.com
          </a>{' '}
          if there's something you'd like to see us write about.
        </p>
      </Section>
    </StaticPageLayout>
  );
}
