import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getClientSocket } from '../../services/socket';
import { Bell, CheckCheck, X, Sparkles, Send, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const socket = getClientSocket();
    if (!socket) return;

    const handleNewNotif = (notif) => {
      setNotifications(prev => [notif, ...prev]);
    };

    socket.on('notification_received', handleNewNotif);
    return () => {
      socket.off('notification_received', handleNewNotif);
    };
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'GMAIL_CONNECTED':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'EMAIL_SENT':
        return <Send className="w-4 h-4 text-cyan-400" />;
      case 'AI_COMPLETED':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'AI_FAILED':
      case 'GMAIL_ERROR':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Mail className="w-4 h-4 text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200 transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">Notifications</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id || n.id}
                className={`p-3 rounded-xl transition ${
                  n.isRead ? 'opacity-70 bg-transparent' : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{n.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 break-words">{n.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
