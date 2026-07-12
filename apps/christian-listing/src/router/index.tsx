import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import OrgLayout from '../components/layout/OrgLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import OrgProtectedRoute from '../components/routing/OrgProtectedRoute';
import HomePage from '../pages/HomePage';
import EventsPage from '../pages/EventsPage';
import AllEventsPage from '../pages/AllEventsPage';
import EventDetailsPage from '../pages/EventDetailsPage';
import MarketplacePage from '../pages/MarketplacePage';
import AllListingsPage from '../pages/AllListingsPage';
import MarketplaceDetailsPage from '../pages/MarketplaceDetailsPage';
import OrganisationProfilePage from '../pages/OrganisationProfilePage';
import JobsPage from '../pages/JobsPage';
import AllJobsPage from '../pages/AllJobsPage';
import JobDetailsPage from '../pages/JobDetailsPage';
import JobApplicationPage from '../pages/JobApplicationPage';
import AuthPage from '../pages/AuthPage';
import DashboardPage from '../pages/DashboardPage';
import MyApplicationsPage from '../pages/MyApplicationsPage';
import SavedItemsPage from '../pages/SavedItemsPage';
import FollowingPage from '../pages/FollowingPage';
import MessagingPage from '../pages/MessagingPage';
import OrganisationInvitePage from '../pages/OrganisationInvitePage';
import OrgTeamPage from '../pages/org/OrgTeamPage';
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
import OrgSettingsPage from '../pages/org/OrgSettingsPage';

const router = createBrowserRouter([
  {
    // ── Public site — top navbar layout ─────────────────────────────
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,           element: <HomePage /> },
      { path: 'events',        element: <EventsPage /> },
      { path: 'events/all',    element: <AllEventsPage /> },
      { path: 'events/:id',    element: <EventDetailsPage /> },
      { path: 'marketplace',   element: <MarketplacePage /> },
      { path: 'marketplace/all', element: <AllListingsPage /> },
      { path: 'marketplace/:id', element: <MarketplaceDetailsPage /> },
      { path: 'organisations/:id', element: <OrganisationProfilePage /> },
      { path: 'jobs',          element: <JobsPage /> },
      { path: 'jobs/all',      element: <AllJobsPage /> },
      { path: 'jobs/:id',      element: <JobDetailsPage /> },
      { path: 'signin',        element: <AuthPage /> },
      { path: 'signup',        element: <AuthPage /> },
      { path: 'onboarding/region',            element: <OnboardingRegionPage /> },
      { path: 'onboarding/preferences',       element: <OnboardingPreferencesPage /> },
      { path: 'org/signup',                   element: <OrgAuthPage /> },
      { path: 'org/onboarding/identity',      element: <OrgIdentityPage /> },
      { path: 'org/onboarding/verification',  element: <OrgVerificationPage /> },
      { path: 'org/onboarding/success',       element: <OrgSuccessPage /> },
      { path: 'org/invite/:token',            element: <OrganisationInvitePage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'dashboard/applications', element: <MyApplicationsPage /> },
          { path: 'dashboard/saved', element: <SavedItemsPage /> },
          { path: 'dashboard/following', element: <FollowingPage /> },
          { path: 'dashboard/messages', element: <MessagingPage /> },
          { path: 'dashboard/messages/:threadId', element: <MessagingPage /> },
          { path: 'profile',   element: <ProfilePage /> },
          { path: 'jobs/:id/apply', element: <JobApplicationPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  {
    // ── Org dashboard — public for testing, auth to be restored pre-launch ──
    path: '/org',
    element: <OrgProtectedRoute><OrgLayout /></OrgProtectedRoute>,
    children: [
      { index: true,        element: <OrgOverviewPage /> },
      { path: 'events',     element: <OrgEventsPage /> },
      { path: 'listings',   element: <OrgListingsPage /> },
      { path: 'jobs',       element: <OrgJobsPage /> },
      { path: 'messages',   element: <MessagingPage sellerMode /> },
      { path: 'messages/:threadId', element: <MessagingPage sellerMode /> },
      { path: 'settings',   element: <OrgSettingsPage /> },
      { path: 'team',       element: <OrgTeamPage /> },
    ],
  },
]);

export default router;
