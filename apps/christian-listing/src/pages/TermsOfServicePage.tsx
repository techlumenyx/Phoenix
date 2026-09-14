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

      <Section title="Account Rules">
        <p>
          To create an account, you must provide accurate, current information; if you're signing up on behalf of an organization, you must
          be authorized to act for it. You're responsible for keeping your account details up to date and your login credentials secure, and
          for any activity that happens under your account.
        </p>
        <p>
          We may suspend an account temporarily while we investigate a suspected violation of these terms, and we may close an account
          permanently for repeated or serious violations. You can stop using the platform and request account deletion at any time by
          contacting us.
        </p>
      </Section>

      <Section title="Your Content">
        <p>
          You retain ownership of the events, listings, job postings, and messages you post. By posting content, you give us permission to
          display it on the platform to other users. You're responsible for making sure your content is accurate and doesn't violate any
          law or infringe anyone else's rights.
        </p>
      </Section>

      <Section title="User Conduct">
        <p>You agree not to, and not to help anyone else:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Post false, misleading, or fraudulent listings, events, job postings, or credentials</li>
          <li>Harass, threaten, or discriminate against other users or organizations</li>
          <li>Impersonate another person or organization, or misrepresent your affiliation with one</li>
          <li>Post content that is unlawful, obscene, defamatory, or infringes someone else's intellectual property or privacy rights</li>
          <li>Use the platform to spam, scam, or solicit payments outside of legitimate listings, events, or job opportunities</li>
          <li>Attempt to interfere with, disrupt, or gain unauthorized access to the platform, other accounts, or our systems</li>
          <li>Scrape, harvest, or misuse other users' data beyond what's needed to engage with a listing, event, or job posting</li>
        </ul>
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

      <Section title="Termination">
        <p>
          We may suspend or terminate your account, remove your content, or restrict your access to the platform, with or without notice, if
          we reasonably believe you've violated these terms, broken the law, or put the community or the platform at risk. We may also stop
          providing all or part of the service at any time.
        </p>
        <p>
          If your account is terminated for a violation, you may not create a new account without our permission. Sections of these terms
          that by their nature should survive termination — including Your Content, Disclaimer of Warranties, and Limitation of Liability —
          will continue to apply.
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
