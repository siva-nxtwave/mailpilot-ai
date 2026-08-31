import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useEmailStore } from '../../store/emailStore';
import { useAIStore } from '../../store/aiStore';
import MessageCard from '../MessageCard/MessageCard';
import AISummaryPanel from '../AISummaryPanel/AISummaryPanel';
import AIActionMenu from '../AIActionMenu/AIActionMenu';
import ReplyComposer from '../ReplyComposer/ReplyComposer';
import { LoadingSkeleton, ErrorState } from '../EmptyState/EmptyState';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Mail,
  CornerUpLeft,
  Users,
  Sparkles
} from 'lucide-react';

export default function ThreadView({ threadId }) {
  const router = useRouter();
  const {
    currentThread,
    isThreadLoading,
    error,
    fetchThread,
    toggleStar,
    archiveEmail,
    trashEmail,
    markAsUnread
  } = useEmailStore();

  const { clearAIState, summarizeEmail } = useAIStore();
  const [activeReplyMessage, setActiveReplyMessage] = useState(null);

  useEffect(() => {
    if (threadId) {
      clearAIState();
      fetchThread(threadId);
    }
  }, [threadId, fetchThread, clearAIState]);

  // Auto-trigger AI summary when opening thread for premium copilot experience
  useEffect(() => {
    if (currentThread && currentThread.messages && currentThread.messages.length > 0) {
      const combinedText = currentThread.messages.map(m => `From: ${m.from}\nDate: ${m.date}\n${m.bodyText || m.snippet}`).join('\n---\n');
      const latest = currentThread.messages[currentThread.messages.length - 1];
      setActiveReplyMessage(latest);
      summarizeEmail(combinedText, {
        subject: currentThread.subject,
        from: latest.from,
        threadId: currentThread.id,
        messageId: latest.id
      });
    }
  }, [currentThread, summarizeEmail]);

  if (isThreadLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (error || !currentThread) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ErrorState
          title="Could not load thread"
          message={error || 'Thread conversation not found.'}
          onRetry={() => fetchThread(threadId)}
        />
      </div>
    );
  }

  const messages = currentThread.messages || [];
  const latestMessage = messages[messages.length - 1] || {};
  const combinedText = messages.map(m => `From: ${m.from}\n${m.bodyText || m.snippet}`).join('\n---\n');

  const handleArchive = async () => {
    if (latestMessage.id) {
      await archiveEmail(latestMessage.id);
      router.push('/dashboard');
    }
  };

  const handleTrash = async () => {
    if (latestMessage.id) {
      await trashEmail(latestMessage.id);
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-20 animate-in fade-in">
        {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            title="Back to Inbox"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {currentThread.subject || '(No Subject)'}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span>{currentThread.participants?.join(', ') || latestMessage.from}</span>
            </div>
          </div>
        </div>

        {/* Quick Email Actions */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => toggleStar(latestMessage.id, latestMessage.isStarred)}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Star Thread"
          >
            <Star className={`w-4 h-4 ${latestMessage.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleArchive}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTrash}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Action Menu */}
      <AIActionMenu
        emailText={combinedText}
        subject={currentThread.subject}
        from={latestMessage.from}
        messageId={latestMessage.id}
        threadId={currentThread.id}
        onDraftReply={() => {
          const el = document.getElementById('reply-composer');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* AI Summary and Insights Panel */}
      <AISummaryPanel />

      {/* Thread Messages List */}
      <div className="space-y-4 mb-8">
        {messages.map((msg, idx) => (
          <MessageCard
            key={msg.id || idx}
            message={msg}
            isLatest={idx === messages.length - 1}
            onReply={(m) => {
              setActiveReplyMessage(m);
              const el = document.getElementById('reply-composer');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        ))}
      </div>

      {/* Reply Composer Section */}
      <div id="reply-composer">
        <ReplyComposer
          targetMessage={activeReplyMessage || latestMessage}
          threadText={combinedText}
          onSent={() => fetchThread(threadId)}
        />
      </div>
    </div>
  );
}
