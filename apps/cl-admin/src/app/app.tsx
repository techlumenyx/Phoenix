import { Navigate, Route, Routes } from 'react-router-dom';
import AdminProtectedRoute from '../auth/AdminProtectedRoute';
import AdminShell from './AdminShell';
import LoginPage from '../pages/LoginPage';
import OverviewPage from '../pages/OverviewPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ModerationQueuePage from '../pages/moderation/ModerationQueuePage';
import ModerationCasePage from '../pages/moderation/ModerationCasePage';
import VerificationQueuePage from '../pages/verification/VerificationQueuePage';
import VerificationCasePage from '../pages/verification/VerificationCasePage';
import DirectoryPage from '../pages/directory/DirectoryPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import AuditPage from '../pages/audit/AuditPage';
import TemplatesPage from '../pages/templates/TemplatesPage';
import CurationPage from '../pages/curation/CurationPage';
import SystemHealthPage from '../pages/SystemHealthPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorised" element={<UnauthorizedPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="moderation" element={<ModerationQueuePage />} />
          <Route path="moderation/:caseId" element={<ModerationCasePage />} />
          <Route path="verifications" element={<VerificationQueuePage />} />
          <Route path="verifications/:verificationId" element={<VerificationCasePage />} />
          <Route path="users" element={<DirectoryPage fixedType="USER" />} />
          <Route path="organisations" element={<DirectoryPage fixedType="ORGANISATION" />} />
          <Route path="content/:type" element={<DirectoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="curation" element={<CurationPage />} />
          <Route path="system" element={<SystemHealthPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
