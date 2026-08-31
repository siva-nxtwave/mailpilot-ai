import { useState, useEffect } from 'react';
import { useEmailStore } from '../../store/emailStore';
import { useAIStore } from '../../store/aiStore';
import ToneSelector from '../ToneSelector/ToneSelector';
import {
  Send,
  Sparkles,
  RefreshCw,
  Edit3,
  Loader2,
  Wand2,
  Check
} from 'lucide-react';

export default function ReplyComposer({ targetMessage, threadText, onSent }) {
  const { replyToEmail, isLoading } = useEmailStore();
  const {
    generatedReply,
    generateSmartReply,
    rewriteText,
    selectedTone,
    isGenerating,
    currentOperation
  } = useAIStore();

  const [body, setBody] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (generatedReply) {
      setBody(generatedReply);
    }
  }, [generatedReply]);

  const handleGenerate = async () => {
    const textToAnalyze = threadText || targetMessage?.bodyText || targetMessage?.snippet || '';
    const res = await generateSmartReply(textToAnalyze, {
      tone: selectedTone,
      customInstructions,
      sender: targetMessage?.from || ''
    });
    if (res) {
      setBody(res);
    }
  };

  const handleRewrite = async (tone) => {
    if (!body.trim()) return;
    const rewritten = await rewriteText(body, tone);
    if (rewritten) {
      setBody(rewritten);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() || !targetMessage?.id) return;

    const res = await replyToEmail(targetMessage.id, body, selectedTone);
    if (res.success) {
      setIsSent(true);
      setBody('');
      if (onSent) onSent();
      setTimeout(() => setIsSent(false), 3000);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-5 shadow-xl transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Reply to {(targetMessage?.from || '').split('<')[0].replace(/["']/g, '').trim()}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Contextual AI-assisted reply drafting</p>
        </div>

        {/* Tone Selector */}
        <ToneSelector compact />
      </div>

      {/* AI Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-indigo-50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            {isGenerating && currentOperation === 'generating_reply' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>AI Draft Reply</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition font-medium"
          >
            {showInstructions ? 'Hide instructions' : '+ Add custom prompt'}
          </button>
        </div>

        {/* Quick Rewrite Pills */}
        {body.trim().length > 0 && (
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-1 hidden sm:inline">Rewrite:</span>
            <button
              type="button"
              onClick={() => handleRewrite('professional')}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700 transition"
            >
              Professional
            </button>
            <button
              type="button"
              onClick={() => handleRewrite('friendly')}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700 transition"
            >
              Friendly
            </button>
            <button
              type="button"
              onClick={() => handleRewrite('shorter')}
              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700 transition"
            >
              Shorter
            </button>
          </div>
        )}
      </div>

      {/* Optional Custom AI Prompt */}
      {showInstructions && (
        <div className="mb-3 animate-in fade-in">
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Tell them I agree with the timeline but need to discuss the budget on Monday..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/70 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Editor Textarea */}
      <form onSubmit={handleSend}>
        <div className="relative">
          <textarea
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your reply or click 'AI Draft Reply' to generate one..."
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none transition"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {body.length > 0 ? `${body.length} characters • Always reviewed by you before sending` : 'AI drafts are editable suggestions'}
          </p>

          <div className="flex items-center space-x-2">
            {isSent && (
              <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in font-medium">
                <Check className="w-4 h-4" />
                <span>Dispatched!</span>
              </span>
            )}

            <button
              type="submit"
              disabled={isLoading || !body.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Send Reply</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
