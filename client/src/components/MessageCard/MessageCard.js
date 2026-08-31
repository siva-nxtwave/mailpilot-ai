import { useState } from 'react';
import { ChevronDown, ChevronUp, Paperclip, Download, CornerUpLeft } from 'lucide-react';

export default function MessageCard({ message, isLatest = false, onReply }) {
  const [isExpanded, setIsExpanded] = useState(isLatest);

  const formattedDate = () => {
    try {
      const d = new Date(message.date);
      return d.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return message.date;
    }
  };

  const senderName = (message.from || '').split('<')[0].replace(/["']/g, '').trim() || 'Unknown';
  const senderEmail = (message.from || '').match(/<([^>]+)>/)?.[1] || message.from;

  return (
    <div className={`rounded-2xl border transition overflow-hidden ${
      isExpanded
        ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 shadow-md'
        : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-800'
    }`}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {senderName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{senderName}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:inline">&lt;{senderEmail}&gt;</span>
            </div>
            {!isExpanded && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{message.snippet}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 ml-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">{formattedDate()}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/50">
          {/* Metadata */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-4">
            <p><span className="text-slate-600 dark:text-slate-400 font-medium">To:</span> {message.to}</p>
            {message.cc && <p><span className="text-slate-600 dark:text-slate-400 font-medium">Cc:</span> {message.cc}</p>}
          </div>

          {/* Body Content */}
          <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line break-words">
            {message.bodyHtml ? (
              <div
                className="prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: message.bodyHtml }}
              />
            ) : (
              message.bodyText || message.snippet
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Attachments ({message.attachments.length})</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-200"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium truncate max-w-xs">{att.filename}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ({Math.round((att.size || 0) / 1024)} KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          {onReply && (
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/50 flex justify-end">
              <button
                type="button"
                onClick={() => onReply(message)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                <CornerUpLeft className="w-3.5 h-3.5" />
                <span>Reply to this message</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
