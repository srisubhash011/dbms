import axios from 'axios';

// Route all API requests through the Nginx API Gateway Load Balancer
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('smartticket_user');
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
