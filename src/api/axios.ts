import axios from 'axios';

export const AUTH_TOKEN_KEY = 'dinely_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.defaults.headers.common['Cache-Control'] = 'no-cache';
api.defaults.headers.common['Pragma'] = 'no-cache';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
