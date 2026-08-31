import { useEffect } from 'react';
import { useEmailStore } from '../../store/emailStore';
import EmailRow from '../EmailRow/EmailRow';
import EmailToolbar from '../EmailToolbar/EmailToolbar';
import BulkActionToolbar from '../BulkActionToolbar/BulkActionToolbar';
import { LoadingSkeleton, EmptyState, ErrorState } from '../EmptyState/EmptyState';

export default function InboxList() {
  const {
    emails,
    isLoading,
    error,
    currentFolder,
    fetchEmails
  } = useEmailStore();

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#090d16] transition-colors duration-200">
      <EmailToolbar />
      <BulkActionToolbar />

      <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800/40">
        {isLoading ? (
          <LoadingSkeleton count={8} />
        ) : error ? (
          <ErrorState
            title="Could not load emails"
            message={error}
            onRetry={() => fetchEmails()}
          />
        ) : emails.length === 0 ? (
          <EmptyState
            title={`No emails in ${currentFolder}`}
            description="Your mailbox is up to date."
            actionText="Refresh"
            onAction={() => fetchEmails()}
          />
        ) : (
          emails.map((email) => (
            <EmailRow key={email.id} email={email} />
          ))
        )}
      </div>
    </div>
  );
}
