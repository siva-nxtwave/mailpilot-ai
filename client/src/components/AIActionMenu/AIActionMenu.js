import { useAIStore } from '../../store/aiStore';
import {
  Sparkles,
  HelpCircle,
  ListTodo,
  Calendar,
  CornerUpLeft,
  Loader2
} from 'lucide-react';

export default function AIActionMenu({ emailText, subject, from, messageId, threadId, onDraftReply }) {
  const {
    summarizeEmail,
    explainEmail,
    extractActionItems,
    extractDates,
    isGenerating,
    currentOperation
  } = useAIStore();

  const handleSummarize = () => {
    summarizeEmail(emailText, { subject, from, messageId, threadId });
  };

  const handleExplain = () => {
    explainEmail(emailText, { messageId, threadId });
  };

  const handleActionItems = () => {
    extractActionItems(emailText, { messageId, threadId });
  };

  const handleDates = () => {
    extractDates(emailText, { messageId, threadId });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <button
        type="button"
        onClick={handleSummarize}
        disabled={isGenerating}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/30 transition shadow-sm hover:border-indigo-500/50 disabled:opacity-50"
      >
        {isGenerating && currentOperation === 'summarizing' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
        )}
        <span>Summarize</span>
      </button>

      <button
        type="button"
        onClick={onDraftReply}
        disabled={isGenerating}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 dark:text-purple-300 dark:border-purple-500/30 transition disabled:opacity-50"
      >
        <CornerUpLeft className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
        <span>Generate Reply</span>
      </button>

      <button
        type="button"
        onClick={handleExplain}
        disabled={isGenerating}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-600/20 dark:hover:bg-cyan-600/30 dark:text-cyan-300 dark:border-cyan-500/30 transition disabled:opacity-50"
      >
        {isGenerating && currentOperation === 'explaining' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <HelpCircle className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
        )}
        <span>Explain</span>
      </button>

      <button
        type="button"
        onClick={handleActionItems}
        disabled={isGenerating}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 dark:text-emerald-300 dark:border-emerald-500/30 transition disabled:opacity-50"
      >
        {isGenerating && currentOperation === 'action_items' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ListTodo className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        )}
        <span>Action Items</span>
      </button>

      <button
        type="button"
        onClick={handleDates}
        disabled={isGenerating}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-600/20 dark:hover:bg-amber-600/30 dark:text-amber-300 dark:border-amber-500/30 transition disabled:opacity-50"
      >
        {isGenerating && currentOperation === 'extracting_dates' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        )}
        <span>Deadlines</span>
      </button>
    </div>
  );
}
