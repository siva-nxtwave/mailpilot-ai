import { useEmailStore } from '../../store/emailStore';
import { RefreshCw, CheckSquare, Square, MinusSquare } from 'lucide-react';

export default function EmailToolbar() {
  const {
    emails,
    selectedEmailIds,
    selectAllEmails,
    clearSelection,
    fetchEmails,
    isLoading,
    currentFolder,
    isDemo
  } = useEmailStore();

  const allSelected = emails.length > 0 && selectedEmailIds.length === emails.length;
  const someSelected = selectedEmailIds.length > 0 && !allSelected;

  const handleSelectToggle = () => {
    if (allSelected || someSelected) {
      clearSelection();
    } else {
      selectAllEmails();
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
      <div className="flex items-center space-x-3">
        {/* Select all toggle */}
        <button
          type="button"
          onClick={handleSelectToggle}
          disabled={emails.length === 0}
          className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition disabled:opacity-40"
          title="Select all"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          ) : someSelected ? (
            <MinusSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => fetchEmails()}
          disabled={isLoading}
          className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition disabled:opacity-40"
          title="Refresh Inbox"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500 dark:text-indigo-400' : ''}`} />
        </button>

        <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">
          {currentFolder}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {isDemo && (
          <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-md">
            Demo Sandbox
          </span>
        )}
        <span className="text-xs text-slate-400">
          {emails.length} {emails.length === 1 ? 'message' : 'messages'}
        </span>
      </div>
    </div>
  );
}
