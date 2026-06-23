import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import HomePage from '../pages/HomePage';
import EventsPage from '../pages/EventsPage';
import MarketplacePage from '../pages/MarketplacePage';
import JobsPage from '../pages/JobsPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import OrgSignupPage from '../pages/OrgSignupPage';
import OrgSetupPage from '../pages/OrgSetupPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────
      { index: true, element: <HomePage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'marketplace', element: <MarketplacePage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'signin', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'org/signup', element: <OrgSignupPage /> },
      { path: 'org/setup', element: <OrgSetupPage /> },

      // ── Protected routes (auth required) ───────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },

      // ── Fallback ───────────────────────────────────────────────────
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
