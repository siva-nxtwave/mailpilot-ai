import { useState } from 'react';
import { useAIStore } from '../../store/aiStore';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  ListTodo,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';

export default function AISummaryPanel({ onInsertReply }) {
  const {
    summary,
    actionItems,
    extractedDates,
    explainData,
    isGenerating,
    lastProvider
  } = useAIStore();

  const [completedTasks, setCompletedTasks] = useState([]);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  const toggleTask = (idx) => {
    if (completedTasks.includes(idx)) {
      setCompletedTasks(completedTasks.filter(i => i !== idx));
    } else {
      setCompletedTasks([...completedTasks, idx]);
    }
  };

  if (!summary && !explainData && !isGenerating) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-indigo-50/70 via-white to-slate-50/70 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-900/40 border border-indigo-200 dark:border-indigo-500/20 p-5 shadow-glow mb-6 animate-in fade-in duration-300 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-500/10 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight">AI Executive Intelligence</h3>
        </div>

        {lastProvider && (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300">
            <Cpu className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span className="capitalize">{lastProvider}</span>
          </div>
        )}
      </div>

      {isGenerating ? (
        <div className="py-6 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium animate-pulse">Analyzing conversation context & extracting key tasks...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Executive Summary */}
          {summary?.summary && (
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider mb-1">
                Summary
              </p>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                {summary.summary}
              </p>
            </div>
          )}

          {/* Key Points */}
          {summary?.keyPoints && summary.keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Key Highlights</span>
              </p>
              <ul className="grid grid-cols-1 gap-1.5">
                {summary.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {((summary?.actionItems && summary.actionItems.length > 0) || (actionItems && actionItems.length > 0)) && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <ListTodo className="w-3.5 h-3.5" />
                <span>Action Items & Next Steps</span>
              </p>
              <div className="space-y-1.5">
                {(summary?.actionItems || actionItems).map((item, idx) => {
                  const isDone = completedTasks.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleTask(idx)}
                      className={`flex items-start justify-between p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-500/20 text-slate-400 line-through'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isDone ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.task || item}</span>
                      </div>
                      {item.priority && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ml-2 ${
                          item.priority === 'High' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Important Dates */}
          {((summary?.importantDates && summary.importantDates.length > 0) || (extractedDates && extractedDates.length > 0)) && (
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Dates & Deadlines</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(summary?.importantDates || extractedDates).map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-500/20 flex items-start space-x-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{d.title || d.event}</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-300 mt-0.5 font-mono">{d.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explain This Email Drawer */}
          {explainData && (
            <div className="border-t border-indigo-100 dark:border-indigo-500/10 pt-3">
              <button
                type="button"
                onClick={() => setIsExplainOpen(!isExplainOpen)}
                className="w-full flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium py-1"
              >
                <div className="flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explain This Email Breakdown</span>
                </div>
                {isExplainOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isExplainOpen && (
                <div className="mt-2 p-3 bg-white dark:bg-slate-950/60 rounded-xl border border-indigo-100 dark:border-indigo-500/10 space-y-2 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
                  <p><strong className="text-slate-900 dark:text-slate-100">Sender's Goal:</strong> {explainData.whatSenderWants}</p>
                  <p><strong className="text-slate-900 dark:text-slate-100">Why it matters:</strong> {explainData.whyItMatters}</p>
                  <p><strong className="text-slate-900 dark:text-slate-100">Required Response:</strong> {explainData.requiredResponse}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
