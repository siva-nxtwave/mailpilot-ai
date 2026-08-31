import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';
import {
  Activity,
  Sparkles,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Cpu
} from 'lucide-react';

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/activity?limit=50');
      if (res.data.success) {
        setActivities(res.data.data.activities);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'AI_OPERATION_COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI Executed</span>
          </span>
        );
      case 'EMAIL_SENT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Send className="w-3 h-3 text-cyan-400" />
            <span>Email Dispatched</span>
          </span>
        );
      case 'GMAIL_CONNECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>OAuth Connected</span>
          </span>
        );
      case 'USER_REGISTERED':
      case 'USER_LOGGED_IN':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>Session Authenticated</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{action.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Audit & Activity History</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Track all email interactions, AI operations, and OAuth lifecycle events</p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchActivities}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Activity List */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-colors">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs animate-pulse">
                Loading audit trail...
              </div>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                No activity records found yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activities.map((act) => (
                  <div key={act._id || act.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="mt-1">
                        {act.success ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          {getActionBadge(act.action)}
                          {act.metadata?.operationType && (
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                              {act.metadata.operationType}
                            </span>
                          )}
                          {act.metadata?.provider && (
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              via {act.metadata.provider} ({act.metadata.duration}ms)
                            </span>
                          )}
                        </div>

                        {act.metadata?.subject && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate max-w-md">
                            Subject: {act.metadata.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 sm:block">
                      <Clock className="w-3 h-3 sm:hidden text-slate-400 dark:text-slate-500 inline" />
                      <span>{new Date(act.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
