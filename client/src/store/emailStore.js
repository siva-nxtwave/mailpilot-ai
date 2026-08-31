import { create } from 'zustand';
import api from '../services/api';

export const useEmailStore = create((set, get) => ({
  currentFolder: 'INBOX',
  emails: [],
  selectedEmailIds: [],
  currentThread: null,
  searchQuery: '',
  isLoading: false,
  isThreadLoading: false,
  error: null,
  isDemo: false,
  connectionStatus: {
    isConnected: false,
    googleAccountEmail: null,
    expiresAt: null
  },

  setCurrentFolder: (folder) => {
    set({ currentFolder: folder, selectedEmailIds: [], searchQuery: '' });
    get().fetchEmails();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  toggleSelectEmail: (id) => {
    const { selectedEmailIds } = get();
    if (selectedEmailIds.includes(id)) {
      set({ selectedEmailIds: selectedEmailIds.filter(item => item !== id) });
    } else {
      set({ selectedEmailIds: [...selectedEmailIds, id] });
    }
  },

  selectAllEmails: () => {
    const { emails, selectedEmailIds } = get();
    if (selectedEmailIds.length === emails.length) {
      set({ selectedEmailIds: [] });
    } else {
      set({ selectedEmailIds: emails.map(e => e.id) });
    }
  },

  clearSelection: () => set({ selectedEmailIds: [] }),

  fetchConnectionStatus: async () => {
    try {
      const res = await api.get('/integrations/gmail/status');
      if (res.data.success) {
        set({ connectionStatus: res.data.data });
      }
    } catch (err) {
      console.warn('Failed to fetch connection status:', err.message);
    }
  },

  fetchEmails: async (folderParam = null) => {
    const folder = folderParam || get().currentFolder;
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/emails', { params: { folder } });
      if (res.data.success) {
        set({
          emails: res.data.data.messages || [],
          isDemo: Boolean(res.data.data.isDemo),
          isLoading: false
        });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  searchEmails: async (query) => {
    if (!query || !query.trim()) {
      return get().fetchEmails();
    }
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const res = await api.get('/emails/search', { params: { q: query } });
      if (res.data.success) {
        set({
          emails: res.data.data.messages || [],
          isDemo: Boolean(res.data.data.isDemo),
          isLoading: false
        });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchThread: async (threadId) => {
    set({ isThreadLoading: true, error: null });
    try {
      const res = await api.get(`/emails/${threadId}/thread`);
      if (res.data.success) {
        set({ currentThread: res.data.data, isThreadLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isThreadLoading: false });
    }
  },

  markAsRead: async (id) => {
    // Optimistic update
    set(state => ({
      emails: state.emails.map(e => e.id === id ? { ...e, isUnread: false } : e)
    }));
    try {
      await api.post(`/emails/${id}/read`);
    } catch (err) {
      get().fetchEmails();
    }
  },

  markAsUnread: async (id) => {
    // Optimistic update
    set(state => ({
      emails: state.emails.map(e => e.id === id ? { ...e, isUnread: true } : e)
    }));
    try {
      await api.post(`/emails/${id}/unread`);
    } catch (err) {
      get().fetchEmails();
    }
  },

  toggleStar: async (id, currentStarred) => {
    // Optimistic update
    set(state => ({
      emails: state.emails.map(e => e.id === id ? { ...e, isStarred: !currentStarred } : e)
    }));
    try {
      if (currentStarred) {
        await api.post(`/emails/${id}/unstar`);
      } else {
        await api.post(`/emails/${id}/star`);
      }
    } catch (err) {
      get().fetchEmails();
    }
  },

  archiveEmail: async (id) => {
    // Optimistic remove from current view
    set(state => ({
      emails: state.emails.filter(e => e.id !== id)
    }));
    try {
      await api.post(`/emails/${id}/archive`);
    } catch (err) {
      get().fetchEmails();
    }
  },

  trashEmail: async (id) => {
    // Optimistic remove
    set(state => ({
      emails: state.emails.filter(e => e.id !== id)
    }));
    try {
      await api.post(`/emails/${id}/trash`);
    } catch (err) {
      get().fetchEmails();
    }
  },

  executeBulkAction: async (action) => {
    const { selectedEmailIds } = get();
    if (selectedEmailIds.length === 0) return;

    try {
      await api.post(`/emails/bulk/${action}`, { ids: selectedEmailIds });
      set({ selectedEmailIds: [] });
      get().fetchEmails();
    } catch (err) {
      set({ error: err.message });
    }
  },

  sendEmail: async (emailData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/emails/send', emailData);
      set({ isLoading: false });
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  replyToEmail: async (id, body, tone) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/emails/${id}/reply`, { body, tone });
      set({ isLoading: false });
      // Refresh current thread
      if (get().currentThread) {
        get().fetchThread(get().currentThread.id);
      }
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  }
}));
