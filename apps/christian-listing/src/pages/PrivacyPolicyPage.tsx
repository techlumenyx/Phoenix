import StaticPageLayout, { Section } from '../components/layout/StaticPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`Last updated: ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`}
    >
      <Section title="Overview">
        <p>
          This policy explains what information Christian Listings collects, how we use it, and the choices you have. We collect only what
          we need to run the platform — helping individuals and organizations connect through events, marketplace listings, and job postings.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>
          <strong>Account information:</strong> when you sign up, we collect your name, email address, and (for organizations) details about
          your organization such as its name, type, and mission statement.
        </p>
        <p>
          <strong>Content you provide:</strong> events, marketplace listings, job postings, messages, profile details, and any photos or
          videos you upload.
        </p>
        <p>
          <strong>Usage information:</strong> basic, anonymized data about how the platform is used (for example, which events or listings
          are viewed) so we can understand what's useful and improve the product.
        </p>
      </Section>

      <Section title="How We Use Information">
        <p>
          We use your information to operate the platform: to authenticate your account, display your listings and messages to the right
          people, personalize content by region, respond to support requests, and keep the community safe by reviewing reports.
        </p>
      </Section>

      <Section title="Cookies & Local Storage">
        <p>
          We use your browser's local storage to keep you signed in and remember basic preferences. We don't use third-party advertising or
          tracking cookies. See our{' '}
          <a href="/cookie-policy" className="font-semibold text-[#1B1B1B] underline">
            Cookie Policy
          </a>{' '}
          for details.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>We rely on a small number of trusted service providers to operate the platform, including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Firebase (Google) for account authentication</li>
          <li>MongoDB Atlas for secure data storage</li>
          <li>Cloudinary for hosting photos and videos you upload</li>
        </ul>
        <p>These providers only receive the information necessary to perform their service and are not permitted to use it for their own purposes.</p>
      </Section>

      <Section title="Sharing of Information">
        <p>
          We don't sell your personal information. Public listings, events, and job postings you create are visible to other users by design.
          Private information like your email address is only shared with the service providers above, or where required by law.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We keep your information for as long as your account is active. If you'd like your account and associated data deleted, contact us
          and we'll process the request.
        </p>
      </Section>

      <Section title="Your Choices">
        <p>
          You can review and update your account details at any time from your profile. To request access to, correction of, or deletion of
          your personal data, email us and we'll help.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>Christian Listings is intended for adults and is not directed at children.</p>
      </Section>

      <Section title="Changes to This Policy">
        <p>We may update this policy from time to time as the platform evolves. We'll update the date at the top of this page when we do.</p>
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
