import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import EmailComposer from '../components/EmailComposer/EmailComposer';

export default function ComposePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <EmailComposer />
      </AppShell>
    </ProtectedRoute>
  );
}
