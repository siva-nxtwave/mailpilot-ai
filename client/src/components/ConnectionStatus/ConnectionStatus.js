import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEmailStore } from '../../store/emailStore';
import { CheckCircle2, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

export default function ConnectionStatus() {
  const { connectionStatus, fetchConnectionStatus } = useEmailStore();

  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  const isConnected = connectionStatus?.isConnected;

  return (
    <div className="px-3 py-2">
      <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
        isConnected
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
          : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300'
      }`}>
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'}`} />
          <div className="truncate text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {isConnected ? (connectionStatus.googleAccountEmail || 'Gmail Connected') : 'Gmail Disconnected'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isConnected ? 'Syncing active' : 'Demo sandbox mode'}
            </p>
          </div>
        </div>

        <Link
          href="/integrations"
          className="shrink-0 p-1.5 hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
          title="Manage Integration"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
