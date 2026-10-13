import HeroSection from '../components/sections/HeroSection';
import SpotlightSection from '../components/sections/HomepageSpotlightSection';
import EventsGlanceSection from '../components/sections/EventsGlanceSection';
import OrgCTASection from '../components/sections/OrgCTASection';
import FeaturedEventsSection from '../components/sections/FeaturedEventsSection';
import FeaturedListingsSection from '../components/sections/FeaturedListingsSection';
import FeaturedJobsSection from '../components/sections/FeaturedJobsSection';
import ChurchCTASection from '../components/sections/ChurchCTASection';
import FAQSection from '../components/sections/FAQSection';
import { useHomepageContent } from '../lib/homepage';
import { usePageSeo } from '../lib/seo';

export default function HomePage() {
  const { content, loading, error, region } = useHomepageContent();

  usePageSeo({
    title: 'Christian Listings | Events, Jobs & Marketplace',
    description: 'A home for the Christian community — discover christian events near you, ministry and charity jobs, and a free marketplace to buy, sell or give.',
    path: '/',
  });

  return (
    <>
      <HeroSection />
      <SpotlightSection content={content?.spotlight} loading={loading} error={error} region={region} />
      <EventsGlanceSection events={content?.glanceEvents} loading={loading} error={error} />
      <OrgCTASection />
      <FeaturedEventsSection />
      <FeaturedListingsSection />
      <FeaturedJobsSection />
      <ChurchCTASection />
      <FAQSection />
    </>
  );
}
