import { create } from 'zustand';
import api from '../services/api';

export const useAIStore = create((set, get) => ({
  isGenerating: false,
  currentOperation: null,
  summary: null,
  generatedReply: '',
  explainData: null,
  actionItems: [],
  extractedDates: [],
  selectedTone: 'professional',
  subjectSuggestions: [],
  lastProvider: null,
  error: null,

  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setGeneratedReply: (reply) => set({ generatedReply: reply }),
  clearAIState: () => set({
    summary: null,
    generatedReply: '',
    explainData: null,
    actionItems: [],
    extractedDates: [],
    subjectSuggestions: [],
    error: null,
    isGenerating: false
  }),

  summarizeEmail: async (emailText, context = {}) => {
    set({ isGenerating: true, currentOperation: 'summarizing', error: null });
    try {
      const res = await api.post('/ai/summarize', { emailText, ...context });
      if (res.data.success) {
        set({
          summary: res.data.data.data,
          actionItems: res.data.data.data.actionItems || [],
          extractedDates: res.data.data.data.importantDates || [],
          lastProvider: res.data.data.provider,
          isGenerating: false
        });
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false });
    }
  },

  generateSmartReply: async (threadText, options = {}) => {
    const tone = options.tone || get().selectedTone;
    set({ isGenerating: true, currentOperation: 'generating_reply', error: null });
    try {
      const res = await api.post('/ai/generate-reply', {
        threadText,
        tone,
        ...options
      });
      if (res.data.success) {
        set({
          generatedReply: res.data.data.data,
          lastProvider: res.data.data.provider,
          isGenerating: false
        });
        return res.data.data.data;
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false });
      return null;
    }
  },

  explainEmail: async (emailText, metadata = {}) => {
    set({ isGenerating: true, currentOperation: 'explaining', error: null });
    try {
      const res = await api.post('/ai/explain', { emailText, ...metadata });
      if (res.data.success) {
        set({
          explainData: res.data.data.data,
          lastProvider: res.data.data.provider,
          isGenerating: false
        });
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false });
    }
  },

  extractActionItems: async (emailText, metadata = {}) => {
    set({ isGenerating: true, currentOperation: 'action_items', error: null });
    try {
      const res = await api.post('/ai/action-items', { emailText, ...metadata });
      if (res.data.success) {
        set({
          actionItems: res.data.data.data,
          lastProvider: res.data.data.provider,
          isGenerating: false
        });
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false });
    }
  },

  extractDates: async (emailText, metadata = {}) => {
    set({ isGenerating: true, currentOperation: 'extracting_dates', error: null });
    try {
      const res = await api.post('/ai/extract-dates', { emailText, ...metadata });
      if (res.data.success) {
        set({
          extractedDates: res.data.data.data,
          lastProvider: res.data.data.provider,
          isGenerating: false
        });
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false });
    }
  },

  rewriteText: async (text, tone) => {
    set({ isGenerating: true, currentOperation: 'rewriting', error: null });
    try {
      const res = await api.post('/ai/rewrite', { text, tone });
      set({ isGenerating: false });
      return res.data?.data?.data || text;
    } catch (err) {
      set({ error: err.message, isGenerating: false });
      return text;
    }
  },

  generateSubjectSuggestions: async (bodyText) => {
    set({ isGenerating: true, currentOperation: 'generating_subject', error: null });
    try {
      const res = await api.post('/ai/generate-subject', { bodyText });
      if (res.data.success) {
        set({
          subjectSuggestions: res.data.data.data || [],
          isGenerating: false
        });
        return res.data.data.data;
      }
    } catch (err) {
      set({ error: err.message, isGenerating: false });
      return [];
    }
  }
}));
