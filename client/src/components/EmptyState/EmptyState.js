import { MailOpen, Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export function EmptyState({
  title = 'No emails found',
  description = 'Your inbox is clear, or no messages match your current filter.',
  actionText,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-glow">
        <MailOpen className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">{message || 'An error occurred while loading this view.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ count = 5 }) {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800/60 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 flex items-center space-x-4">
          <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-1.5">
            <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-1/2 h-3 rounded bg-slate-200/60 dark:bg-slate-800/60" />
          </div>
          <div className="w-16 h-4 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

