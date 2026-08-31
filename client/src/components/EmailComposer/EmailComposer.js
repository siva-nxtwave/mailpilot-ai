import { useState } from 'react';
import { useRouter } from 'next/router';
import { useEmailStore } from '../../store/emailStore';
import { useAIStore } from '../../store/aiStore';
import ToneSelector from '../ToneSelector/ToneSelector';
import {
  Send,
  Sparkles,
  Paperclip,
  Trash2,
  Check,
  Loader2,
  Wand2,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';

export default function EmailComposer() {
  const router = useRouter();
  const { sendEmail, isLoading } = useEmailStore();
  const {
    rewriteText,
    generateSubjectSuggestions,
    subjectSuggestions,
    isGenerating,
    currentOperation
  } = useAIStore();

  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerateSubjects = async () => {
    if (!body.trim()) {
      setError('Please write some content in the message body first to generate subject suggestions.');
      return;
    }
    setError(null);
    await generateSubjectSuggestions(body);
  };

  const handleSelectSubject = (s) => {
    setSubject(s);
  };

  const handleRewrite = async (tone) => {
    if (!body.trim()) return;
    const res = await rewriteText(body, tone);
    if (res) setBody(res);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!to.trim()) {
      setError('Please provide a recipient email address (To).');
      return;
    }
    if (!subject.trim()) {
      setError('Please provide an email subject.');
      return;
    }

    const res = await sendEmail({
      to,
      cc: showCc ? cc : undefined,
      bcc: showCc ? bcc : undefined,
      subject,
      body
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } else {
      setError(res.error || 'Failed to dispatch email.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">New Message</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI-native email creation & rewriting</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 backdrop-blur-md transition-colors">
        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Email successfully sent! Redirecting to inbox...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* To Field */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <label className="w-16 text-xs font-semibold text-slate-600 dark:text-slate-400">To:</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@domain.com"
              required
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowCc(!showCc)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-2 py-1 rounded font-medium"
            >
              {showCc ? 'Hide CC/BCC' : 'Cc / Bcc'}
            </button>
          </div>

          {/* Cc / Bcc Fields */}
          {showCc && (
            <div className="space-y-3 pt-1 animate-in fade-in">
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <label className="w-16 text-xs font-semibold text-slate-600 dark:text-slate-400">Cc:</label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="colleague@domain.com"
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <label className="w-16 text-xs font-semibold text-slate-600 dark:text-slate-400">Bcc:</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="archive@domain.com"
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Subject Field + AI Generator */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 pb-2">
            <label className="w-16 text-xs font-semibold text-slate-600 dark:text-slate-400">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project update / deliverables..."
              required
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-medium"
            />
            <button
              type="button"
              onClick={handleGenerateSubjects}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 transition disabled:opacity-40"
              title="Generate AI Subject suggestions from body"
            >
              {isGenerating && currentOperation === 'generating_subject' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Suggest Subject</span>
            </button>
          </div>

          {/* Suggested Subject Pills */}
          {subjectSuggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 rounded-xl animate-in fade-in">
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold flex items-center space-x-1 mr-1">
                <Lightbulb className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                <span>Suggestions:</span>
              </span>
              {subjectSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSubject(s)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs border border-indigo-200 dark:border-indigo-500/30 transition shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* AI Rewrite & Tone Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Tone Enhancers:</span>
              <button
                type="button"
                onClick={() => handleRewrite('professional')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                Professional
              </button>
              <button
                type="button"
                onClick={() => handleRewrite('friendlier')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                Friendly
              </button>
              <button
                type="button"
                onClick={() => handleRewrite('shorter')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                Concise
              </button>
            </div>
          </div>

          {/* Body Textarea */}
          <div>
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your email here..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none transition"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {body.length} characters
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Discard
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
