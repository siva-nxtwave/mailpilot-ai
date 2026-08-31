import { useRouter } from 'next/router';
import { Star, Paperclip, Sparkles, Check } from 'lucide-react';
import { useEmailStore } from '../../store/emailStore';

export default function EmailRow({ email }) {
  const router = useRouter();
  const { selectedEmailIds, toggleSelectEmail, toggleStar } = useEmailStore();

  const isSelected = selectedEmailIds.includes(email.id);

  const handleClick = (e) => {
    // Avoid triggering when clicking checkbox or star
    if (e.target.closest('.no-row-click')) return;
    router.push(`/emails/${email.threadId || email.id}`);
  };

  const formattedDate = () => {
    try {
      const d = new Date(email.date);
      const isToday = new Date().toDateString() === d.toDateString();
      return isToday
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const senderName = (email.from || '').split('<')[0].replace(/["']/g, '').trim() || 'Unknown';

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800/60 cursor-pointer transition select-none ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/20'
          : email.isUnread
          ? 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-850/80 shadow-sm'
          : 'bg-slate-50/60 dark:bg-slate-950/30 hover:bg-slate-100/80 dark:hover:bg-slate-900/40 opacity-90'
      }`}
    >
      {/* Checkbox */}
      <div className="no-row-click mr-3 flex items-center">
        <button
          type="button"
          onClick={() => toggleSelectEmail(email.id)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition ${
            isSelected
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-900'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      </div>

      {/* Star */}
      <div className="no-row-click mr-3">
        <button
          type="button"
          onClick={() => toggleStar(email.id, email.isStarred)}
          className={`p-1 rounded-md transition ${
            email.isStarred
              ? 'text-amber-400 hover:text-amber-300'
              : 'text-slate-400 dark:text-slate-600 hover:text-amber-400 group-hover:text-slate-500'
          }`}
        >
          <Star className={`w-4 h-4 ${email.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Unread indicator bullet */}
      <div className="w-2 mr-3 flex justify-center">
        {email.isUnread && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-glow" />
        )}
      </div>

      {/* Sender */}
      <div className="w-44 sm:w-52 shrink-0 truncate mr-3">
        <span className={`text-xs truncate block ${email.isUnread ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
          {senderName}
        </span>
      </div>

      {/* Subject & Preview */}
      <div className="flex-1 min-w-0 flex items-center space-x-2 mr-3">
        <span className={`text-xs truncate ${email.isUnread ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
          {email.subject || '(No Subject)'}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:inline">
          — {email.snippet || ''}
        </span>
      </div>

      {/* Attachments Icon */}
      {email.hasAttachments && (
        <div className="mr-3 text-slate-400 shrink-0">
          <Paperclip className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Date */}
      <div className="shrink-0 text-right">
        <span className={`text-[11px] ${email.isUnread ? 'font-semibold text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
          {formattedDate()}
        </span>
      </div>
    </div>
  );
}
