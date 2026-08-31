import { create } from 'zustand';
import api from '../services/api';
import { initClientSocket, disconnectClientSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize and restore session from localStorage
  initAuth: async () => {
    if (typeof window === 'undefined') return;
    try {
      const storedToken = localStorage.getItem('mailpilot_token');
      const storedUser = localStorage.getItem('mailpilot_user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        set({
          token: storedToken,
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false
        });

        initClientSocket(parsedUser.id || parsedUser._id);

        // Verify with backend
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            set({ user: res.data.data });
            localStorage.setItem('mailpilot_user', JSON.stringify(res.data.data));
          }
        } catch {
          // If token invalid, handled by interceptor
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('mailpilot_token', token);
      localStorage.setItem('mailpilot_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      initClientSocket(user.id || user._id);
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('mailpilot_token', token);
      localStorage.setItem('mailpilot_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      initClientSocket(user.id || user._id);
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('mailpilot_token');
      localStorage.removeItem('mailpilot_user');
      disconnectClientSocket();
      set({ user: null, token: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null })
}));
