import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEmailStore } from '../../store/emailStore';
import ConnectionStatus from '../ConnectionStatus/ConnectionStatus';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import {
  Inbox,
  Star,
  Send,
  FileEdit,
  Archive,
  Trash2,
  Bookmark,
  Plus,
  Activity,
  Shield,
  Settings,
  Sparkles,
  Mail
} from 'lucide-react';

const FOLDERS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox },
  { id: 'STARRED', label: 'Starred', icon: Star },
  { id: 'SENT', label: 'Sent', icon: Send },
  { id: 'DRAFT', label: 'Drafts', icon: FileEdit },
  { id: 'IMPORTANT', label: 'Important', icon: Bookmark },
  { id: 'ARCHIVE', label: 'Archive', icon: Archive },
  { id: 'TRASH', label: 'Trash', icon: Trash2 },
];

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const { currentFolder, setCurrentFolder } = useEmailStore();

  const handleSelectFolder = (folderId) => {
    setCurrentFolder(folderId);
    if (router.pathname !== '/dashboard') {
      router.push('/dashboard');
    }
    if (onClose) onClose();
  };

  const isNavActive = (path) => router.pathname === path;

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">MailPilot</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono ml-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
            </div>
          </Link>
        </div>

        {/* Primary Action */}
        <div className="p-3">
          <Link
            href="/compose"
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Message</span>
          </Link>
        </div>

        {/* Mailbox Folders */}
        <div className="px-3 py-2">
          <p className="px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Mailboxes
          </p>
          <nav className="space-y-0.5">
            {FOLDERS.map((folder) => {
              const Icon = folder.icon;
              const isActive = router.pathname === '/dashboard' && currentFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleSelectFolder(folder.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{folder.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tools and Views */}
        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800/80">
          <p className="px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Productivity
          </p>
          <nav className="space-y-0.5">
            <Link
              href="/activity"
              onClick={onClose}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                isNavActive('/activity')
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Activity History</span>
            </Link>

            <Link
              href="/integrations"
              onClick={onClose}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                isNavActive('/integrations')
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Gmail OAuth</span>
            </Link>

            <Link
              href="/settings"
              onClick={onClose}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                isNavActive('/settings')
                  ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Integration Pill & Theme Switcher */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Appearance</span>
          <ThemeToggle />
        </div>
        <ConnectionStatus />
      </div>
    </aside>
  );
}
