import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../services/api';
import {
  Settings,
  User,
  Shield,
  Cpu,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Moon,
  Sun,
  Zap,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        const res = await api.get('/ai/status');
        if (res.data.success) {
          setAiStatus(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to fetch AI provider status:', err.message);
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAIStatus();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in transition-colors">
          {/* Header */}
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Workspace Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Account profiles, security, and AI provider diagnostics</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Account Profile Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>User Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">Full Name</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Pilot User'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">Email Address</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.email || 'user@mailpilot.ai'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">Access Role</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{user?.role || 'User'}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">Account Status</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active & Verified</span>
                  </p>
                </div>
              </div>
            </div>

            {/* AI Providers Diagnostic Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>AI Multi-Tier Provider Cascade</span>
              </h3>

              <div className="space-y-3">
                {/* OpenRouter */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">1. OpenRouter (Primary)</p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{aiStatus?.openrouter?.model || 'anthropic/claude-3.5-sonnet'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    aiStatus?.openrouter?.configured
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {aiStatus?.openrouter?.configured ? 'Configured' : 'Not Configured (Optional)'}
                  </span>
                </div>

                {/* Gemini */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">2. Google Gemini (Secondary Fallback)</p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{aiStatus?.gemini?.model || 'gemini-1.5-flash'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    aiStatus?.gemini?.configured
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {aiStatus?.gemini?.configured ? 'Configured' : 'Not Configured (Optional)'}
                  </span>
                </div>

                {/* Deterministic Fallback */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">3. Deterministic NLP Engine (Offline Fallback)</p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Rule-based extractor & smart reply templates</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    Always Online (100%)
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Preference Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Interface Theme Appearance</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                    theme === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-400 dark:border-indigo-500/50 shadow-glow text-slate-900 dark:text-slate-100'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-200">Dark Mode</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">High-contrast executive theme with glowing accents</p>
                    </div>
                  </div>
                  {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                    theme === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 border-indigo-400 dark:border-indigo-500/50 shadow-glow text-slate-900 dark:text-slate-100'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-amber-500 dark:text-amber-400">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-200">Light Mode</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clean daylight contrast for daytime productivity</p>
                    </div>
                  </div>
                  {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />}
                </button>
              </div>
            </div>

            {/* Logout Session Action */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Log out of MailPilot</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">End your local session on this device</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs font-semibold transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
