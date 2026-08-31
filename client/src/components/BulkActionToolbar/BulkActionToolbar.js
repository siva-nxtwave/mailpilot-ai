import { useEmailStore } from '../../store/emailStore';
import { Mail, MailOpen, Star, Archive, Trash2, X } from 'lucide-react';

export default function BulkActionToolbar() {
  const {
    selectedEmailIds,
    clearSelection,
    executeBulkAction
  } = useEmailStore();

  if (selectedEmailIds.length === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-indigo-50 dark:bg-indigo-950/80 border-b border-indigo-200 dark:border-indigo-500/30 text-xs animate-in slide-in-from-top-1 transition-colors">
      <div className="flex items-center space-x-3">
        <span className="font-semibold text-indigo-900 dark:text-indigo-200">
          {selectedEmailIds.length} selected
        </span>
        <button
          type="button"
          onClick={clearSelection}
          className="p-1 rounded text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
          title="Clear Selection"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          type="button"
          onClick={() => executeBulkAction('read')}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 transition"
        >
          <MailOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mark Read</span>
        </button>

        <button
          type="button"
          onClick={() => executeBulkAction('unread')}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 transition"
        >
          <Mail className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mark Unread</span>
        </button>

        <button
          type="button"
          onClick={() => executeBulkAction('star')}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 transition"
        >
          <Star className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Star</span>
        </button>

        <button
          type="button"
          onClick={() => executeBulkAction('archive')}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/30 transition"
        >
          <Archive className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Archive</span>
        </button>

        <button
          type="button"
          onClick={() => executeBulkAction('trash')}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}
