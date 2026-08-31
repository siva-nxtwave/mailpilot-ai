import axios from 'axios';

const getApiBaseUrl = () => {
  let url = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!url) return 'http://localhost:5001/api';
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000 // 45s timeout to allow Render free tier cold-start to wake up
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
    let message = errorData?.message;
    const code = errorData?.code || 'UNKNOWN_ERROR';

    if (!error.response) {
      message = 'Server is currently waking up or unreachable. Please wait 20-30 seconds and try again.';
    } else if (code === 'AUTH_EXPIRED') {
      message = 'Your Gmail connection has expired. Please reconnect Gmail to continue.';
    } else if (code === 'AUTH_INVALID' || code === 'AUTH_REQUIRED') {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('mailpilot_token');
        localStorage.removeItem('mailpilot_user');
        window.location.href = '/login';
      }
    }

    const enhancedError = new Error(message || error.message || 'An unexpected error occurred');
    enhancedError.code = code;
    enhancedError.details = errorData?.details;
    enhancedError.response = error.response;

    return Promise.reject(enhancedError);
  }
);

export default api;
