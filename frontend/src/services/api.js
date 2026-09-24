import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://online-learning-platform-1-o6ng.onrender.com/api'
);


const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


// Attach JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('learnpulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global response error interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, could clear token
      // localStorage.removeItem('learnpulse_token');
    }
    return Promise.reject(error);
  }
);

export default API;
