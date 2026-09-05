import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function AboutUsPage() {
  return (
    <StaticPageLayout
      eyebrow="Our Story"
      title="About Christian Listings"
      intro="A curated ecosystem of faith-led ministries, community events, and grace-centered marketplaces."
    >
      <Section title="Our Mission">
        <p>
          Christian Listings exists to help faith communities and the diaspora find each other — whether that's a church event happening down the street,
          a job opening at a Christian organization, or a marketplace listing shared in good faith by someone in the community.
        </p>
      </Section>

      <Section title="What We Do">
        <p>
          We bring three things together in one place: <strong>Events</strong> for ministries and community groups to reach the people
          they serve, <strong>Marketplace</strong> for individuals and organizations to buy, sell, or give away items within the community,
          and <strong>Jobs</strong> for Christian organizations to hire and for individuals to find meaningful work.
        </p>
      </Section>

      <Section title="Who We Serve">
        <p>
          We serve individuals and organizations across the Christian diaspora — churches, charities, ministries, and the people who make up
          their communities — wherever they are.
        </p>
      </Section>

      <Section title="Get in Touch">
        <p>
          Questions, feedback, or partnership ideas? We'd love to hear from you at{' '}
          <a href="mailto:christianlistingsinfo@gmail.com" className="font-semibold text-[#1B1B1B] underline">
            christianlistingsinfo@gmail.com
          </a>
          .
        </p>
      </Section>
    </StaticPageLayout>
  );
}
