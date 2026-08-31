import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../services/api';
import { useEmailStore } from '../store/emailStore';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  RefreshCw,
  LogOut,
  Sparkles,
  Info,
  Check
} from 'lucide-react';

export default function IntegrationsPage() {
  const router = useRouter();
  const { connectionStatus, fetchConnectionStatus } = useEmailStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchConnectionStatus();
    if (router.query.success === 'gmail_connected') {
      setSuccessMsg('Gmail connected successfully via OAuth 2.0!');
    }
    if (router.query.error) {
      setError(`OAuth Error: ${router.query.error}`);
    }
  }, [fetchConnectionStatus, router.query]);

  const handleConnectGmail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/integrations/gmail/oauth/start');
      if (res.data.success && res.data.data.url) {
        window.location.href = res.data.data.url;
      }
    } catch (err) {
      setError(err.message || 'Could not initialize Google OAuth flow.');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail integration?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/integrations/gmail/disconnect');
      if (res.data.success) {
        setSuccessMsg('Gmail integration disconnected.');
        fetchConnectionStatus();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = connectionStatus?.isConnected;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in transition-colors">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Gmail & OAuth Integrations</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your connected Gmail account and OAuth permissions</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 mb-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Primary Connection Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl mb-8 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2.5">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                    alt="Gmail"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Google Gmail Integration</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-amber-500 dark:bg-amber-400'}`} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isConnected ? `Connected as ${connectionStatus.googleAccountEmail}` : 'Disconnected (Demo Sandbox Mode)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={handleConnectGmail}
                      disabled={isLoading}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
                    >
                      Reconnect
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={isLoading}
                      className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-500/30 transition"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGmail}
                    disabled={isLoading}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Connect Gmail with Google</span>
                  </button>
                )}
              </div>
            </div>

            {/* Permission Scopes Detail */}
            <div className="pt-6">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Requested Google OAuth Scopes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">gmail.readonly</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Read messages, threads, and metadata for AI analysis</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">gmail.send</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Send composed emails and user-confirmed smart replies</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">gmail.modify</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Update read/unread, star, archive, and trash states</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">userinfo.email & profile</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Identify your connected Google Account</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Guarantee */}
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 flex items-start space-x-3.5 transition-colors">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">Enterprise Token Encryption</p>
              <p className="text-slate-600 dark:text-slate-400">
                MailPilot encrypts all Google OAuth refresh tokens at rest with AES-256-GCM. We never store or ask for your Google password, and raw tokens are never exposed to the client interface.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
