import HeroSection from '../components/sections/HeroSection';
import SpotlightSection from '../components/sections/SpotlightSection';
import EventsGlanceSection from '../components/sections/EventsGlanceSection';
import OrgCTASection from '../components/sections/OrgCTASection';
import FeaturedEventsSection from '../components/sections/FeaturedEventsSection';
import FeaturedListingsSection from '../components/sections/FeaturedListingsSection';
import FeaturedJobsSection from '../components/sections/FeaturedJobsSection';
import ChurchCTASection from '../components/sections/ChurchCTASection';
import FAQSection from '../components/sections/FAQSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SpotlightSection />
      <EventsGlanceSection />
      <OrgCTASection />
      <FeaturedEventsSection />
      <FeaturedListingsSection />
      <FeaturedJobsSection />
      <ChurchCTASection />
      <FAQSection />
    </>
  );
}
