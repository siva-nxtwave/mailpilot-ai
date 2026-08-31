import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import InboxList from '../components/InboxList/InboxList';
import { useEmailStore } from '../store/emailStore';

export default function DashboardPage() {
  const router = useRouter();
  const { searchEmails } = useEmailStore();

  useEffect(() => {
    if (router.query.search) {
      searchEmails(router.query.search);
    }
  }, [router.query.search, searchEmails]);

  return (
    <ProtectedRoute>
      <AppShell>
        <InboxList />
      </AppShell>
    </ProtectedRoute>
  );
}
