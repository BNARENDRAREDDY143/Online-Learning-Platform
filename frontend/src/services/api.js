import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
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
