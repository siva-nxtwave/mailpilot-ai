import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import SearchBar from '../SearchBar/SearchBar';
import NotificationDrawer from '../NotificationDrawer/NotificationDrawer';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import {
  Bell,
  Plus,
  Sparkles,
  User,
  LogOut,
  Settings,
  Activity,
  Menu,
  Shield
} from 'lucide-react';

export default function TopBar({ onToggleSidebar }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
        {/* Left Side */}
        <div className="flex items-center space-x-3 flex-1 max-w-2xl">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <SearchBar />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Compose Button */}
          <Link
            href="/compose"
            className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Compose</span>
          </Link>

          {/* AI Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span className="font-medium">AI Copilot Active</span>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div
                onMouseLeave={() => setIsUserMenuOpen(false)}
                className="absolute right-0 mt-2 w-56 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Pilot User'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'user@mailpilot.ai'}</p>
                </div>

                <Link
                  href="/activity"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Activity History</span>
                </Link>

                <Link
                  href="/integrations"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Gmail OAuth Settings</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Notifications */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}
