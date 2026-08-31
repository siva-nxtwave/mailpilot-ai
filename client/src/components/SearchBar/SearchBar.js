import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useEmailStore } from '../../store/emailStore';
import { Search, X, Filter, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'is:unread', desc: 'Unread emails' },
  { label: 'is:starred', desc: 'Starred emails' },
  { label: 'has:attachment', desc: 'Emails with files' },
  { label: 'from:', desc: 'Specific sender' },
  { label: 'subject:', desc: 'Subject keywords' }
];

export default function SearchBar() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, searchEmails } = useEmailStore();
  const [query, setQuery] = useState(searchQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      searchEmails(query.trim());
      if (router.pathname !== '/dashboard' && router.pathname !== '/search') {
        router.push(`/dashboard?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (syntax) => {
    const updated = query ? `${query} ${syntax}` : syntax;
    setQuery(updated);
    setSearchQuery(updated);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchQuery('');
    searchEmails('');
  };

  return (
    <div className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchQuery(e.target.value);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search mail (e.g. is:unread, from:sarah, invoice)..."
          className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner focus:bg-white dark:focus:bg-slate-900"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Gmail Syntax Filter Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 backdrop-blur-md">
          <div className="flex items-center space-x-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>Search Filters & Syntax</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onMouseDown={() => handleSuggestionClick(s.label)}
                className="flex items-center justify-between p-2 rounded-xl text-left bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/60 hover:border-indigo-500/30 transition text-xs"
              >
                <code className="text-indigo-600 dark:text-indigo-300 font-mono text-[11px] font-semibold">{s.label}</code>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
