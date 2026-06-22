import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import OrgLayout from '../components/layout/OrgLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import HomePage from '../pages/HomePage';
import EventsPage from '../pages/EventsPage';
import MarketplacePage from '../pages/MarketplacePage';
import JobsPage from '../pages/JobsPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import OrgOverviewPage from '../pages/org/OrgOverviewPage';
import OrgEventsPage from '../pages/org/OrgEventsPage';
import OrgListingsPage from '../pages/org/OrgListingsPage';
import OrgJobsPage from '../pages/org/OrgJobsPage';
import OrgMessagesPage from '../pages/org/OrgMessagesPage';
import OrgSettingsPage from '../pages/org/OrgSettingsPage';

const router = createBrowserRouter([
  {
    // ── Public site — top navbar layout ─────────────────────────────
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,           element: <HomePage /> },
      { path: 'events',        element: <EventsPage /> },
      { path: 'marketplace',   element: <MarketplacePage /> },
      { path: 'jobs',          element: <JobsPage /> },
      { path: 'signin',        element: <SignInPage /> },
      { path: 'signup',        element: <SignUpPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile',   element: <ProfilePage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  {
    // ── Org dashboard — own sidebar layout, no public navbar ─────────
    path: '/org',
    element: <ProtectedRoute />,
    children: [
      {
        element: <OrgLayout />,
        children: [
          { index: true,          element: <OrgOverviewPage /> },
          { path: 'events',       element: <OrgEventsPage /> },
          { path: 'listings',     element: <OrgListingsPage /> },
          { path: 'jobs',         element: <OrgJobsPage /> },
          { path: 'messages',     element: <OrgMessagesPage /> },
          { path: 'settings',     element: <OrgSettingsPage /> },
        ],
      },
    ],
  },
]);

export default router;
