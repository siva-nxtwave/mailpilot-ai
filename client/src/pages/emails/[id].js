import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import ThreadView from '../../components/ThreadView/ThreadView';

export default function ThreadPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <AppShell>
        {id && <ThreadView threadId={id} />}
      </AppShell>
    </ProtectedRoute>
  );
}
