import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import OrgLayout from '../components/layout/OrgLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import HomePage from '../pages/HomePage';
import EventsPage from '../pages/EventsPage';
import MarketplacePage from '../pages/MarketplacePage';
import JobsPage from '../pages/JobsPage';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import OnboardingRegionPage from '../pages/onboarding/OnboardingRegionPage';
import OnboardingPreferencesPage from '../pages/onboarding/OnboardingPreferencesPage';
import OrgAuthPage from '../pages/org-auth/OrgAuthPage';
import OrgIdentityPage from '../pages/org-auth/OrgIdentityPage';
import OrgVerificationPage from '../pages/org-auth/OrgVerificationPage';
import OrgSuccessPage from '../pages/org-auth/OrgSuccessPage';
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
      { path: 'signin',        element: <AuthPage /> },
      { path: 'signup',        element: <AuthPage /> },
      { path: 'onboarding/region',         element: <OnboardingRegionPage /> },
      { path: 'onboarding/preferences',   element: <OnboardingPreferencesPage /> },
      { path: 'org/signup',               element: <OrgAuthPage /> },
      { path: 'org/onboarding/identity',  element: <OrgIdentityPage /> },
      { path: 'org/onboarding/verification', element: <OrgVerificationPage /> },
      { path: 'org/onboarding/success',   element: <OrgSuccessPage /> },

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
    // ── Org dashboard — public for testing, auth to be restored pre-launch ──
    path: '/org',
    element: <OrgLayout />,
    children: [
      { index: true,        element: <OrgOverviewPage /> },
      { path: 'events',     element: <OrgEventsPage /> },
      { path: 'listings',   element: <OrgListingsPage /> },
      { path: 'jobs',       element: <OrgJobsPage /> },
      { path: 'messages',   element: <OrgMessagesPage /> },
      { path: 'settings',   element: <OrgSettingsPage /> },
    ],
  },
]);

export default router;
