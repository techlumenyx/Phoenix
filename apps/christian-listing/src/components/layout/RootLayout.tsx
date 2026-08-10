import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import RouteAnalytics from '../analytics/RouteAnalytics';
import WhatsNewPopover from '../announcements/WhatsNewPopover';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <RouteAnalytics />
      <WhatsNewPopover />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
