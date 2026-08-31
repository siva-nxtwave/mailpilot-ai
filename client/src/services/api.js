import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('mailpilot_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data?.error;
    let message = errorData?.message || error.message || 'An unexpected error occurred';
    const code = errorData?.code || 'UNKNOWN_ERROR';

    if (code === 'AUTH_EXPIRED') {
      message = 'Your Gmail connection has expired. Please reconnect Gmail to continue.';
    } else if (code === 'AUTH_INVALID' || code === 'AUTH_REQUIRED') {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('mailpilot_token');
        localStorage.removeItem('mailpilot_user');
        window.location.href = '/login';
      }
    }

    const enhancedError = new Error(message);
    enhancedError.code = code;
    enhancedError.details = errorData?.details;
    enhancedError.response = error.response;

    return Promise.reject(enhancedError);
  }
);

export default api;
