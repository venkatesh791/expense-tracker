import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

// Clean up baseURL to ensure it always ends with /api
if (baseURL && baseURL.startsWith('http')) {
  // Remove any trailing slashes
  baseURL = baseURL.replace(/\/+$/, '');
  // Append /api if not present
  if (!baseURL.endsWith('/api')) {
    baseURL = `${baseURL}/api`;
  }
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth header and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `%c[API Request] ${config.method.toUpperCase()} ${config.url}`,
      'color: #00bcd4; font-weight: bold;',
      { data: config.data, params: config.params }
    );
    return config;
  },
  (error) => {
    console.error('%c[API Request Error]', 'color: #f44336; font-weight: bold;', error);
    return Promise.reject(error);
  }
);

// Response interceptor to log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(
      `%c[API Response Success] ${response.config.method.toUpperCase()} ${response.config.url} - Status ${response.status}`,
      'color: #4caf50; font-weight: bold;',
      response.data
    );
    return response;
  },
  (error) => {
    const response = error.response;
    console.error(
      `%c[API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status ${response?.status || 'Unknown'}`,
      'color: #f44336; font-weight: bold;',
      response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
