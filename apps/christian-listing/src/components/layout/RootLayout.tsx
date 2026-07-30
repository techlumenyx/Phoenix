import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import RouteAnalytics from '../analytics/RouteAnalytics';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <RouteAnalytics />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
