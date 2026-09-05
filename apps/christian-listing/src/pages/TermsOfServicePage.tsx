import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function TermsOfServicePage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro={`Last updated: ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`}
    >
      <Section title="Acceptance of Terms">
        <p>
          By creating an account or using Christian Listings, you agree to these terms. If you're signing up on behalf of an organization,
          you confirm that you're authorized to do so.
        </p>
      </Section>

      <Section title="Your Account">
        <p>
          You're responsible for keeping your account details accurate and your login credentials secure, and for any activity that happens
          under your account.
        </p>
      </Section>

      <Section title="Your Content">
        <p>
          You retain ownership of the events, listings, job postings, and messages you post. By posting content, you give us permission to
          display it on the platform to other users. You're responsible for making sure your content is accurate and doesn't violate any
          law or infringe anyone else's rights.
        </p>
      </Section>

      <Section title="Community Standards">
        <p>
          Christian Listings is a platform that connects individuals and organizations and does not independently verify the identity,
          credentials, or claims of any user or organization listed on the site. We are not responsible or liable for any loss, damage,
          dispute, or claim arising from fraudulent activity, misrepresentation, or misconduct by any user or organization. Users are
          encouraged to exercise their own discretion and due diligence before engaging with any listing, event, job, or opportunity on this
          platform.
        </p>
      </Section>

      <Section title="Suspension & Termination">
        <p>
          We may suspend or remove content or accounts that violate these terms or that we reasonably believe put the community at risk. You
          can stop using the platform and request account deletion at any time.
        </p>
      </Section>

      <Section title="Disclaimer of Warranties">
        <p>
          The platform is provided "as is." We work to keep it reliable and accurate, but we don't guarantee that it will always be
          uninterrupted, error-free, or that any listing, event, or job posting is genuine or successful.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the fullest extent permitted by law, Christian Listings is not liable for indirect, incidental, or consequential damages
          arising from your use of the platform or your interactions with other users or organizations.
        </p>
      </Section>

      <Section title="Changes to These Terms">
        <p>We may update these terms as the platform evolves. We'll update the date at the top of this page when we do.</p>
      </Section>

      <Section title="Contact Us">
        <p>
          Questions about these terms? Email us at{' '}
          <a href="mailto:christianlistingsinfo@gmail.com" className="font-semibold text-[#1B1B1B] underline">
            christianlistingsinfo@gmail.com
          </a>
          .
        </p>
      </Section>
    </StaticPageLayout>
  );
}
